import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.backends.backend_pdf import PdfPages

output_pdf = r"c:\Users\ankij\OneDrive\Desktop\Hospital Management System Project\Schedula_Schedule_Module_ERD.pdf"

with PdfPages(output_pdf) as pdf:
    # -------------------------------------------------------------------------
    # PAGE 1: SIMPLE & CLEAR ER DIAGRAM (5 MODULES)
    # -------------------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.set_xlim(0, 160)
    ax.set_ylim(0, 90)
    ax.axis('off')

    # Title
    ax.text(80, 83, "SCHEDULA &bull; HOSPITAL MANAGEMENT SYSTEM", fontsize=18, fontweight='bold', color='#0f172a', ha='center')
    ax.text(80, 79.5, "Schedule Project Module &bull; Simple ER Diagram (5 Core Modules in Order)", fontsize=11, color='#64748b', ha='center')

    # Function to draw a clean entity box
    def draw_box(ax, x, y, w, h, title, mod_num, color, fields):
        # Card body
        card = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2",
                                      edgecolor=color, facecolor='#f8fafc', linewidth=2.0)
        ax.add_patch(card)
        # Header banner
        header_h = 4.0
        header = patches.Rectangle((x, y + h - header_h), w, header_h, facecolor=color, edgecolor='none')
        ax.add_patch(header)
        # Header text
        ax.text(x + w / 2, y + h - 2.6, f"[{mod_num}] {title}", fontsize=10, fontweight='bold', color='#ffffff', ha='center')

        # Fields
        cur_y = y + h - header_h - 2.8
        for ftype, fname, fkey in fields:
            key_color = '#0284c7' if fkey == 'PK' else ('#ec4899' if fkey == 'FK' else '#64748b')
            ax.text(x + 1.2, cur_y, fkey, fontsize=8, fontweight='bold', color=key_color, family='monospace')
            ax.text(x + 4.8, cur_y, fname, fontsize=8.5, color='#1e293b', fontweight='bold' if fkey == 'PK' else 'normal')
            ax.text(x + w - 1.2, cur_y, ftype, fontsize=7.5, color='#94a3b8', ha='right', family='monospace')
            cur_y -= 2.6

    # 1. User Module (Left Center)
    draw_box(ax, 8, 32, 28, 20, "USERS", "M1", "#6366f1", [
        ("UUID", "id", "PK"),
        ("VARCHAR", "email", "REQ"),
        ("VARCHAR", "password", "REQ"),
        ("VARCHAR", "role", "REQ"),
    ])

    # 2. Patient Module (Top Middle)
    draw_box(ax, 46, 50, 30, 24, "PATIENTS", "M2", "#10b981", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id", "FK"),
        ("VARCHAR", "name", "REQ"),
        ("VARCHAR", "phone", "OPT"),
        ("VARCHAR", "gender", "OPT"),
        ("DATE", "date_of_birth", "OPT"),
    ])

    # 3. Doctor Module (Bottom Middle)
    draw_box(ax, 46, 12, 30, 22, "DOCTORS", "M3", "#f59e0b", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id", "FK"),
        ("VARCHAR", "name", "REQ"),
        ("VARCHAR", "specialization", "REQ"),
        ("DECIMAL", "consultation_fee", "REQ"),
    ])

    # 4. Availability Module (Bottom Right)
    draw_box(ax, 90, 12, 32, 24, "DOCTOR_AVAILABILITY", "M4", "#ec4899", [
        ("UUID", "id", "PK"),
        ("UUID", "doctor_id", "FK"),
        ("VARCHAR", "day_of_week", "REQ"),
        ("TIME", "start_time", "REQ"),
        ("TIME", "end_time", "REQ"),
        ("BOOLEAN", "is_available", "DEF"),
    ])

    # 5. Appointment Module (Far Right Center)
    draw_box(ax, 124, 45, 30, 24, "APPOINTMENTS", "M5", "#3b82f6", [
        ("UUID", "id", "PK"),
        ("UUID", "patient_id", "FK"),
        ("UUID", "doctor_id", "FK"),
        ("DATE", "appointment_date", "REQ"),
        ("TIME", "time_slot", "REQ"),
        ("VARCHAR", "status", "DEF"),
    ])

    # Helper function for clean relationship lines
    def draw_link(ax, p1, p2, label, col='#0f172a', rad=0.0):
        con = patches.ConnectionPatch(
            xyA=p1, coordsA=ax.transData,
            xyB=p2, coordsB=ax.transData,
            arrowstyle="->,head_width=0.35,head_length=0.45",
            connectionstyle=f"arc3,rad={rad}",
            color=col, linewidth=1.8, linestyle="--"
        )
        ax.add_patch(con)
        mx = (p1[0] + p2[0]) / 2.0
        my = (p1[1] + p2[1]) / 2.0 + (rad * 8)
        ax.text(mx, my, label, fontsize=8, color=col, fontweight='bold', ha='center', va='center',
                bbox=dict(boxstyle="round,pad=0.2", facecolor='#ffffff', edgecolor=col, linewidth=1))

    # USERS -> PATIENTS (1:1)
    draw_link(ax, (36, 47), (46, 60), "1 : 1", "#10b981")
    # USERS -> DOCTORS (1:1)
    draw_link(ax, (36, 37), (46, 23), "1 : 1", "#f59e0b")
    # DOCTORS -> DOCTOR_AVAILABILITY (1:N)
    draw_link(ax, (76, 23), (90, 23), "1 : N", "#ec4899")
    # PATIENTS -> APPOINTMENTS (1:N)
    draw_link(ax, (76, 62), (124, 62), "1 : N", "#3b82f6")
    # DOCTORS -> APPOINTMENTS (1:N)
    draw_link(ax, (76, 30), (124, 50), "1 : N", "#3b82f6", rad=-0.15)

    # Footer
    ax.text(80, 4, "PearlThoughts Internship &bull; Simple, Clear & Readable ER Diagram (5 Modules in Order)", fontsize=9, color='#94a3b8', ha='center')

    plt.tight_layout()
    pdf.savefig(fig, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

print(f"SUCCESS: Simplified PDF generated at {output_pdf}")
