
import sys

try:
    with open(r'd:\My Project\SkillNear Project\skillnear\client\src\components\dashboard\desktop\DashboardDesktop.jsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i in range(2470, 2510):
            if i < len(lines):
                print(f"{i+1}: {lines[i]}", end='')
except Exception as e:
    print(f"Error: {e}")
