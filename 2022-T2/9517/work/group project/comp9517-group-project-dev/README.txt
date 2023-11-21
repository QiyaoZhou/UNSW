Install
git clone https://github.com/ultralytics/yolov5
cd yolov5
pip install -r requirements.txt
git clone https://github.com/ZQPei/deep_sort_pytorch.git ../deep_sort

labeltxt.py
- transform the labels of STEP dataset to rectangles. The result *.txt file can be fed in yolov5.

demo.py
- main flow of the program.
-- Load model of yolo/other
-- Load model of deepsort/other
-- Read input video/images
-- invoke detection and tracking models for each image
-- invoke PedestrianManager to manage detection and tracking results
-- invoke Render to draw detection and tracking information on each image
-- save/show generated video/images

PedestrianManager.py
- It manages detection and tracking results for each pedestrian
- It includes algorithms such as group inspection and pedestrian entry.

Render.py
- Drawing detection and tracking results
-- Drawing colored rectangle and trajectory for each pedestrian
-- Drawing group rectangles
-- Displaying counting text
