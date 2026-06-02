import cv2
import mediapipe as mp
import math
import collections
import time
import numpy as np

mp_hands = mp.solutions.hands
mp_draw  = mp.solutions.drawing_utils

# ══════════════════════════════════════════════════════════════════
# MAGIC RING EFFECT
# ══════════════════════════════════════════════════════════════════
def draw_magic_ring(frame, cx, cy, cmd, t):
    h, w = frame.shape[:2]
    overlay = frame.copy()

    if cmd == "left":
        gold, gold2, spark = (0, 200, 255), (0, 140, 210), (0, 220, 255)
        spin_dir, r_list   = 1, [100, 78, 56, 38]
    elif cmd == "right":
        gold, gold2, spark = (30, 130, 255), (0, 80, 220), (60, 160, 255)
        spin_dir, r_list   = -1, [100, 78, 56, 38]
    elif cmd == "spin":
        gold, gold2, spark = (180, 60, 255), (120, 0, 200), (220, 120, 255)
        spin_dir, r_list   = 2, [120, 95, 70, 48]

    speed = 1.8

    # 1. Glow background
    for glow_r in range(r_list[0] + 30, r_list[0] - 5, -4):
        cv2.circle(overlay, (cx, cy), glow_r, gold, 2, cv2.LINE_AA)
        cv2.addWeighted(overlay, 0.05, frame, 0.95, 0, frame)
        overlay = frame.copy()

    # 2. Main rings
    ring_configs = [
        (r_list[0], 3, 0.95, 12, 0.15),
        (r_list[1], 2, 0.90,  8, 0.20),
        (r_list[2], 2, 0.85, 16, 0.10),
        (r_list[3], 1, 0.80,  6, 0.25),
    ]
    for idx, (radius, thick, alpha_base, n_seg, gap) in enumerate(ring_configs):
        angle_offset = t * speed * spin_dir * (1 + idx * 0.3)
        seg_angle    = 2 * math.pi / n_seg
        draw_angle   = seg_angle * (1 - gap)
        for seg in range(n_seg):
            a_start = angle_offset + seg * seg_angle
            a_end   = a_start + draw_angle
            steps   = max(8, int(draw_angle * radius / 3))
            pts     = []
            for s in range(steps + 1):
                a  = a_start + (a_end - a_start) * s / steps
                px = int(cx + radius * math.cos(a))
                py = int(cy + radius * math.sin(a))
                if 0 <= px < w and 0 <= py < h:
                    pts.append([px, py])
            if len(pts) >= 2:
                arr = np.array(pts, dtype=np.int32)
                cv2.polylines(overlay, [arr], False, gold,  thick + 1, cv2.LINE_AA)
                cv2.polylines(frame,   [arr], False, gold2, thick,     cv2.LINE_AA)
        cv2.addWeighted(overlay, alpha_base, frame, 1 - alpha_base, 0, frame)
        overlay = frame.copy()

    # 3. Rune symbols
    for radius, n_runes, size in [(r_list[0], 8, 7), (r_list[1], 6, 5), (r_list[2], 10, 4)]:
        angle_offset = t * speed * spin_dir * 0.8
        for j in range(n_runes):
            a  = angle_offset + j * (2 * math.pi / n_runes)
            rx = int(cx + radius * math.cos(a))
            ry = int(cy + radius * math.sin(a))
            if not (0 <= rx < w and 0 <= ry < h):
                continue
            rune_type = j % 4
            if rune_type == 0:
                diamond = np.array([[rx, ry-size],[rx+size, ry],[rx, ry+size],[rx-size, ry]], dtype=np.int32)
                cv2.polylines(frame, [diamond], True, gold, 1, cv2.LINE_AA)
            elif rune_type == 1:
                tri = np.array([[rx + int(size*math.cos(a + k*2*math.pi/3)),
                                 ry + int(size*math.sin(a + k*2*math.pi/3))]
                                for k in range(3)], dtype=np.int32)
                cv2.polylines(frame, [tri], True, gold, 1, cv2.LINE_AA)
            elif rune_type == 2:
                cv2.line(frame, (rx-size, ry), (rx+size, ry), gold, 1, cv2.LINE_AA)
                cv2.line(frame, (rx, ry-size), (rx, ry+size), gold, 1, cv2.LINE_AA)
            elif rune_type == 3:
                cv2.circle(frame, (rx, ry), size - 2, gold, 1, cv2.LINE_AA)

    # 4. Inner mandala
    inner_r = r_list[3] - 10
    if inner_r > 5:
        for k in range(12):
            a  = t * speed * spin_dir * 0.5 + k * (2 * math.pi / 12)
            x1 = int(cx + 8 * math.cos(a));        y1 = int(cy + 8 * math.sin(a))
            x2 = int(cx + inner_r * math.cos(a));  y2 = int(cy + inner_r * math.sin(a))
            if 0<=x1<w and 0<=y1<h and 0<=x2<w and 0<=y2<h:
                cv2.line(frame, (x1, y1), (x2, y2), gold2, 1, cv2.LINE_AA)
        cv2.circle(frame, (cx, cy),  8, gold,  -1, cv2.LINE_AA)
        cv2.circle(frame, (cx, cy), 12, gold2,  1, cv2.LINE_AA)

    # 5. Spark particles
    spark_r = r_list[0] + 18
    for j in range(16):
        a      = t * speed * spin_dir * 1.6 + j * (2 * math.pi / 16)
        pulse  = 1 + 0.5 * math.sin(t * 6 + j * 1.3)
        sr     = int(spark_r + 8 * math.sin(t * 3 + j))
        sx, sy = int(cx + sr * math.cos(a)), int(cy + sr * math.sin(a))
        if 0 <= sx < w and 0 <= sy < h:
            trail_a = a - spin_dir * 0.15
            tx = int(cx + sr * math.cos(trail_a))
            ty = int(cy + sr * math.sin(trail_a))
            if 0 <= tx < w and 0 <= ty < h:
                cv2.line(frame, (tx, ty), (sx, sy), gold2, 1, cv2.LINE_AA)
            cv2.circle(frame, (sx, sy), max(1, int(3 * pulse)), spark, -1, cv2.LINE_AA)

    # 6. Star of Agamotto
    for k in range(6):
        a    = t * speed * spin_dir * 0.4 + k * (2 * math.pi / 6)
        aopp = a + math.pi / 6
        x1, y1 = int(cx + r_list[2]*math.cos(a)),    int(cy + r_list[2]*math.sin(a))
        x2, y2 = int(cx + r_list[2]*math.cos(aopp)), int(cy + r_list[2]*math.sin(aopp))
        if all(0 <= v < d for v, d in [(x1,w),(y1,h),(x2,w),(y2,h)]):
            cv2.line(frame, (x1,y1), (x2,y2), gold2, 1, cv2.LINE_AA)


def get_hand_center(lm, fw, fh):
    return (int(sum(l.x for l in lm) / len(lm) * fw),
            int(sum(l.y for l in lm) / len(lm) * fh))


# ══════════════════════════════════════════════════════════════════
# HAND DETECTION
# ══════════════════════════════════════════════════════════════════
def get_fingers(lm):
    fingers  = []
    thumb_up = lm[4].y < lm[3].y or lm[4].x < lm[3].x
    fingers.append(1 if thumb_up else 0)
    for tip, pip in [(8,6),(12,10),(16,14),(20,18)]:
        fingers.append(1 if lm[tip].y < lm[pip].y else 0)
    return fingers

def get_hand_state(lm, fingers):
    p, i, m, r, l = fingers
    return {
        "open":     (i==1 and m==1 and r==1 and l==1),
        "fist":     (i==0 and m==0 and r==0 and l==0),
        "point":    (i==1 and m==0 and r==0 and l==0),
        "steering": (p==1 and i==0 and m==0 and r==0 and l==0),
    }


# ══════════════════════════════════════════════════════════════════
# ROTATION TRACKER
# ══════════════════════════════════════════════════════════════════
class RotationTracker:
    def __init__(self, history=20):
        self.positions = collections.deque(maxlen=history)
        self.direction = None

    def update(self, x, y):
        self.positions.append((x, y))
        if len(self.positions) < 10:
            self.direction = None
            return
        pts         = list(self.positions)
        total_cross = sum(
            (pts[i][0]-pts[i-1][0]) * (pts[i+1][1]-pts[i][1]) -
            (pts[i][1]-pts[i-1][1]) * (pts[i+1][0]-pts[i][0])
            for i in range(1, len(pts)-1)
        )
        total_dist = sum(
            math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])
            for i in range(1, len(pts))
        )
        if total_dist < 0.04:
            self.direction = None
        elif total_cross > 0.001:
            self.direction = "ccw"
        elif total_cross < -0.001:
            self.direction = "cw"
        else:
            self.direction = None

    def clear(self):
        self.positions.clear()
        self.direction = None

tracker = RotationTracker()


# ══════════════════════════════════════════════════════════════════
# COMMAND LOGIC
# ══════════════════════════════════════════════════════════════════
def get_command(hands_data):
    left  = hands_data.get("Left")
    right = hands_data.get("Right")

    if not left and not right:
        tracker.clear()
        return "stop"

    if left and not right:
        if left["state"]["point"]:
            return "backward"
        tracker.clear()
        return "stop"
    if right and not left:
        if right["state"]["point"]:
            return "backward"
        tracker.clear()
        return "stop"

    l_state = left["state"]
    r_state = right["state"]

    tracker.update(right["lm"][0].x, right["lm"][0].y)

    if l_state["point"] or r_state["point"]:
        return "backward"
    if l_state["open"] and r_state["open"]:
        return "forward"
    if l_state["fist"] and r_state["fist"] and tracker.direction is None:
        return "stop"
    if l_state["fist"] and r_state["fist"] and tracker.direction is not None:
        return "spin"
    if l_state["fist"] and r_state["open"] and tracker.direction == "ccw":
        return "left"
    if l_state["fist"] and r_state["open"] and tracker.direction == "cw":
        return "right"

    return "stop"


# ══════════════════════════════════════════════════════════════════
# UI CONFIG
# ══════════════════════════════════════════════════════════════════
labels_text = {
    "forward":  ">> FORWARD",
    "backward": "^  BACKWARD",
    "left":     "<  LEFT",
    "right":    "   RIGHT  >",
    "spin":     "@  SPIN",
    "stop":     "|| STOP",
}
colors = {
    "forward":  (0,   255, 0),
    "backward": (0,   165, 255),
    "left":     (255, 255, 0),
    "right":    (0,   255, 255),
    "spin":     (255, 0,   255),
    "stop":     (0,   0,   255),
}

def state_str(s):
    if s.get("point"):    return "point"
    if s.get("open"):     return "open"
    if s.get("fist"):     return "fist"
    if s.get("steering"): return "steer"
    return "none"


# ══════════════════════════════════════════════════════════════════
# MAIN LOOP
# ══════════════════════════════════════════════════════════════════
cap = cv2.VideoCapture(0)

with mp_hands.Hands(
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
) as hands:

    print("เปิดกล้องแล้ว กด Q เพื่อออก")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False
        results = hands.process(rgb)
        rgb.flags.writeable = True

        hands_data = {}

        if results.multi_hand_landmarks and results.multi_handedness:
            for hand_lm, hand_info in zip(
                results.multi_hand_landmarks,
                results.multi_handedness
            ):
                label   = hand_info.classification[0].label
                lm      = hand_lm.landmark
                fingers = get_fingers(lm)
                state   = get_hand_state(lm, fingers)
                hands_data[label] = {"lm": lm, "fingers": fingers, "state": state}

                mp_draw.draw_landmarks(frame, hand_lm, mp_hands.HAND_CONNECTIONS)

                cx = int(lm[0].x * frame.shape[1])
                cy = int(lm[0].y * frame.shape[0])
                cv2.putText(frame, label, (cx, cy - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

        cmd      = get_command(hands_data)
        t        = time.time()
        h_fr, w_fr = frame.shape[:2]

        # Magic Ring
        if cmd in ("left", "right", "spin"):
            for side in ("Left", "Right"):
                if side in hands_data:
                    lm     = hands_data[side]["lm"]
                    cx, cy = get_hand_center(lm, w_fr, h_fr)
                    draw_magic_ring(frame, cx, cy, cmd, t)

        # UI
        color = colors.get(cmd, (255, 255, 255))
        cv2.putText(frame, labels_text.get(cmd, cmd), (20, 55),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, color, 3)

        # Debug bar
        l_s = hands_data.get("Left",  {}).get("state", {})
        r_s = hands_data.get("Right", {}).get("state", {})
        rot = tracker.direction or "none"
        cv2.putText(frame,
                    f"L:{state_str(l_s)}  R:{state_str(r_s)}  ROT:{rot}",
                    (20, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

        cv2.imshow("Hand Gesture Test (No JetBot)", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
print("ปิดระบบเรียบร้อย")