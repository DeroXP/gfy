import multiprocessing
import time
import tkinter as tk
from mss import mss
import keyboard
import numpy as np
import os
import json
import cv2
from pynput import keyboard
from pynput.keyboard import Controller, Key

class Dot:
    def __init__(self, canvas, x, y, key):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.key = key
        self.size = 10
        self.draw()

    def draw(self):
        x0 = self.x - self.size
        y0 = self.y - self.size
        x1 = self.x + self.size
        y1 = self.y + self.size
        self.object_id = self.canvas.create_oval(x0, y0, x1, y1, fill="white")
        self.canvas.tag_bind(self.object_id, '<ButtonPress-1>', self.on_click)
        self.canvas.tag_bind(self.object_id, '<B1-Motion>', self.on_drag)

    def on_click(self, event):
        self.start_x = event.x
        self.start_y = event.y

    def on_drag(self, event):
        self.x += event.x - self.start_x
        self.y += event.y - self.start_y
        self.canvas.coords(self.object_id,
                           self.x - self.size,
                           self.y - self.size,
                           self.x + self.size,
                           self.y + self.size)
        self.start_x = event.x
        self.start_y = event.y

def save_dot_positions(dots):
    dot_positions = []
    for dot in dots:
        dot_positions.append({'x': dot.x, 'y': dot.y, 'key': dot.key})
    with open('dot_positions.json', 'w') as f:
        json.dump(dot_positions, f)

def load_dot_positions():
    dot_positions = []
    if os.path.exists('dot_positions.json'):
        with open('dot_positions.json', 'r') as f:
            dot_positions = json.load(f)
    return dot_positions

key_controller = Controller()

def check_color(x, y, key, q_pressed, terminate_event, status, delay=0.001, area_width=20, area_height=15, threshold=1):
    sct = mss()
    keyboard = Controller()  # Initialize pynput keyboard controller
    target_color = np.array([85, 85, 85])  # Define the target color

    while not terminate_event.is_set():
        try:
            if q_pressed.is_set():
                # Grab the screen image with an expanded bounding box around the dot
                bbox = {'top': y - area_height, 'left': x - area_width, 'width': 2*area_width, 'height': 2*area_height}
                screen_image = np.array(sct.grab(bbox))

                # Convert the image to grayscale using OpenCV
                grayscale_image = cv2.cvtColor(screen_image, cv2.COLOR_BGR2GRAY)

                # Check if black color is detected
                if np.mean(grayscale_image) < threshold:
                    print(f"Position ({x}, {y}) is black.")
                    time.sleep(delay)  # Add delay before releasing the key
                    keyboard.release(key)  # Release key using pynput
                else:
                    # Check if the color is under (85, 85, 85)
                    if np.all(np.mean(screen_image[:, :, :3], axis=(0, 1)) < target_color):
                        print(f"Position ({x}, {y}) is under low limit.")
                        continue  # Skip the rest of the loop

                    print(f"Position ({x}, {y}) is not black.")
                    print(f"Key {key} is pressed for dot at position ({x}, {y}).")

                    if key in ['d', 'f', 'j', 'k'] and q_pressed.is_set():
                        time.sleep(delay)  # Add delay before pressing the key
                        keyboard.press(key)  # Press key using pynput

        except Exception as e:
            print(f"Error in color checking process: {e}")
            status['color_process'] = 'error'  # Update status in case of error

        # Update process status
        status['color_process'] = 'running'

        # Minimize sleep interval to keep the process active
        time.sleep(0.0001)  # Adjust the delay time as needed

def key_monitor(q_pressed, terminate_event, status):
    q_toggle = False

    def on_press(key):
        nonlocal q_toggle
        if key == keyboard.Key.f1:  # Change this to whatever key you want to use
            q_toggle = not q_toggle
            if q_toggle:
                q_pressed.set()
            else:
                q_pressed.clear()

    # Start a listener for key presses
    listener = keyboard.Listener(on_press=on_press)
    listener.start()

    while not terminate_event.is_set():
        # Minimize sleep interval to keep the process active
        time.sleep(0.0001)  # Adjust the delay time as needed

        # Update process status
        status['key_monitor'] = 'running'

    # Join the listener to the main thread
    listener.join()

def main():
    # Create dots and map them to keys
    dots = []

    root = tk.Tk()
    root.attributes("-alpha", 0.5)  # Set transparency of the window
    root.attributes("-fullscreen", True)  # Make window full screen
    root.configure(bg='black')  # Set background color to black
    
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    
    canvas = tk.Canvas(root, width=screen_width, height=screen_height, bg='black', highlightthickness=0)
    canvas.pack()

    terminate_event = multiprocessing.Event()
    q_pressed = multiprocessing.Event()

    def on_close():
        terminate_event.set()
        save_dot_positions(dots)
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_close)

    # Create shared status dictionary
    manager = multiprocessing.Manager()
    status = manager.dict()

    def place_dot(event):
        nonlocal dots
        if len(dots) < 4:
            key = ['d', 'f', 'j', 'k'][len(dots)]  # 'd', 'f', 'j', 'k'
            dot = Dot(canvas, event.x, event.y, key)
            dots.append(dot)
            # Start a process for checking color for this dot
            check_color_process = multiprocessing.Process(target=check_color, args=(event.x, event.y, key, q_pressed, terminate_event, status))
            check_color_process.daemon = True
            check_color_process.start()
            print(f"Dot placed at position ({event.x}, {event.y}) with key '{key}' assigned.")

    canvas.bind('<Button-1>', place_dot)

    # Load previously saved dot positions
    dot_positions = load_dot_positions()
    for pos in dot_positions:
        dot = Dot(canvas, pos['x'], pos['y'], pos['key'])
        dots.append(dot)
        # Start a process for checking color for this dot
        check_color_process = multiprocessing.Process(target=check_color, args=(pos['x'], pos['y'], pos['key'], q_pressed, terminate_event, status))
        check_color_process.daemon = True
        check_color_process.start()

    # Start process for monitoring 'q' key press
    key_monitor_process = multiprocessing.Process(target=key_monitor, args=(q_pressed, terminate_event, status))
    key_monitor_process.daemon = True
    key_monitor_process.start()

    root.mainloop()

if __name__ == "__main__":
    main()