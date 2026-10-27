import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.backends.backend_pdf import PdfPages

output_pdf = r"c:\Users\ankij\OneDrive\Desktop\Hospital Management System Project\Schedula_Schedule_Module_ERD.pdf"

with PdfPages(output_pdf) as pdf:
    # -------------------------------------------------------------------------
    # PAGE 1: VISUAL ER DIAGRAM (5 MODULES - FULL ATTRIBUTE DETAILS)
    # -------------------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(19, 11), dpi=300)
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')
    ax.set_xlim(0, 190)
    ax.set_ylim(0, 110)
    ax.axis('off')

    # Title
    ax.text(10, 103, "SCHEDULA &bull; HOSPITAL MANAGEMENT SYSTEM", fontsize=18, fontweight='bold', color='#38bdf8')
    ax.text(10, 99.5, "Schedule Project Module &bull; Complete 5-Entity Relational Architecture", fontsize=11, color='#94a3b8')

    # Module Legend Pills at Top
    pills = [
        ("1. User Module", "#818cf8", 98),
        ("2. Patient Module", "#34d399", 116),
        ("3. Doctor Module", "#fbbf24", 135),
        ("4. Availability Module", "#f472b6", 154),
        ("5. Appointment Module", "#60a5fa", 174),
    ]
    for label, col, cx in pills:
        pill_box = patches.FancyBboxPatch((cx - 8.5, 98.5), 17, 4.2, boxstyle="round,pad=0.2",
                                          edgecolor=col, facecolor='#1e293b', linewidth=1.5)
        ax.add_patch(pill_box)
        ax.text(cx, 100.6, label, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#f8fafc')

    # Function to draw an entity box
    def draw_entity(ax, x, y, w, h, title, mod_num, header_color, fields):
        # Card body
        card = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2",
                                      edgecolor=header_color, facecolor='#1e293b', linewidth=1.8)
        ax.add_patch(card)
        # Header banner
        header_h = 4.0
        header = patches.Rectangle((x, y + h - header_h), w, header_h, facecolor=header_color, edgecolor='none')
        ax.add_patch(header)
        # Header text
        txt_color = '#0f172a' if header_color in ['#34d399', '#fbbf24'] else '#ffffff'
        ax.text(x + w / 2, y + h - 2.6, f"[{mod_num}] {title}", fontsize=9.5, fontweight='bold', color=txt_color, ha='center')

        # Fields
        cur_y = y + h - header_h - 2.5
        for ftype, fname, fkey in fields:
            key_color = '#38bdf8' if fkey == 'PK' else ('#f472b6' if fkey == 'FK' else '#64748b')
            ax.text(x + 1.2, cur_y, fkey, fontsize=7.2, fontweight='bold', color=key_color, family='monospace')
            ax.text(x + 4.8, cur_y, fname, fontsize=7.8, color='#f8fafc', fontweight='bold' if fkey == 'PK' else 'normal')
            ax.text(x + w - 1.2, cur_y, ftype, fontsize=7.0, color='#94a3b8', ha='right', family='monospace')
            cur_y -= 2.35

    # 1. User Module (Left Center)
    draw_entity(ax, 8, 42, 33, 46, "USERS", "M1", "#818cf8", [
        ("UUID", "id", "PK"),
        ("VARCHAR", "email (UNIQUE)", "REQ"),
        ("VARCHAR", "phone (UNIQUE)", "OPT"),
        ("VARCHAR", "password_hash", "OPT"),
        ("VARCHAR", "role [DOC|PAT|ADM]", "REQ"),
        ("VARCHAR", "auth_provider", "REQ"),
        ("BOOLEAN", "is_verified", "REQ"),
        ("TIMESTAMP", "created_at", "SYS"),
        ("TIMESTAMP", "updated_at", "SYS"),
    ])

    # 2. Patient Module (Top Middle)
    draw_entity(ax, 50, 48, 35, 48, "PATIENTS", "M2", "#34d399", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id (1:1)", "FK"),
        ("VARCHAR", "first_name", "REQ"),
        ("VARCHAR", "last_name", "REQ"),
        ("DATE", "date_of_birth", "REQ"),
        ("VARCHAR", "gender [M|F|O]", "REQ"),
        ("VARCHAR", "blood_group", "OPT"),
        ("VARCHAR", "emergency_contact", "OPT"),
        ("TEXT", "address", "OPT"),
        ("TEXT", "medical_history", "OPT"),
        ("TIMESTAMP", "created_at", "SYS"),
    ])

    # 3. Doctor Module (Bottom Middle)
    draw_entity(ax, 50, 4, 35, 41, "DOCTORS", "M3", "#fbbf24", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id (1:1)", "FK"),
        ("VARCHAR", "first_name", "REQ"),
        ("VARCHAR", "last_name", "REQ"),
        ("VARCHAR", "specialization", "REQ"),
        ("VARCHAR", "license_number", "REQ"),
        ("INT", "experience_years", "REQ"),
        ("DECIMAL", "consultation_fee", "REQ"),
        ("TEXT", "bio", "OPT"),
        ("DECIMAL", "rating_average", "REQ"),
        ("BOOLEAN", "is_approved", "REQ"),
    ])

    # 4. Availability Module (Bottom Right)
    draw_entity(ax, 96, 4, 36, 41, "DOCTOR_AVAILABILITY", "M4", "#f472b6", [
        ("UUID", "id", "PK"),
        ("UUID", "doctor_id", "FK"),
        ("VARCHAR", "day_of_week", "REQ"),
        ("TIME", "start_time", "REQ"),
        ("TIME", "end_time", "REQ"),
        ("INT", "slot_duration_minutes", "REQ"),
        ("INT", "max_capacity (Elastic)", "REQ"),
        ("BOOLEAN", "is_active", "REQ"),
        ("TIMESTAMP", "created_at", "SYS"),
    ])

    # 5. Appointment Module (Far Right Center)
    draw_entity(ax, 142, 38, 38, 56, "APPOINTMENTS", "M5", "#60a5fa", [
        ("UUID", "id", "PK"),
        ("UUID", "patient_id", "FK"),
        ("UUID", "doctor_id", "FK"),
        ("DATE", "appointment_date", "REQ"),
        ("TIME", "start_time", "REQ"),
        ("TIME", "end_time", "REQ"),
        ("VARCHAR", "status [CONF|CANC|...]", "REQ"),
        ("TEXT", "reason (Symptoms)", "OPT"),
        ("TEXT", "cancellation_reason", "OPT"),
        ("TEXT", "reschedule_reason", "OPT"),
        ("TIMESTAMP", "created_at", "SYS"),
        ("TIMESTAMP", "updated_at", "SYS"),
    ])

    # Helper function for relationship lines
    def draw_rel(ax, p1, p2, label, color='#94a3b8', rad=0.0):
        con = patches.ConnectionPatch(
            xyA=p1, coordsA=ax.transData,
            xyB=p2, coordsB=ax.transData,
            arrowstyle="->,head_width=0.35,head_length=0.45",
            connectionstyle=f"arc3,rad={rad}",
            color=color, linewidth=1.6, linestyle="--"
        )
        ax.add_patch(con)
        mx = (p1[0] + p2[0]) / 2.0
        my = (p1[1] + p2[1]) / 2.0 + (rad * 8)
        ax.text(mx, my, label, fontsize=7.2, color=color, fontweight='bold', ha='center', va='center',
                bbox=dict(boxstyle="round,pad=0.2", facecolor='#0f172a', edgecolor=color, alpha=0.9))

    # Connectors
    draw_rel(ax, (41, 68), (50, 72), "identifies (1:1)", '#34d399')
    draw_rel(ax, (41, 55), (50, 25), "identifies (1:1)", '#fbbf24', rad=-0.2)
    draw_rel(ax, (85, 25), (96, 25), "configures (1:N)", '#f472b6')
    draw_rel(ax, (85, 72), (142, 72), "books (1:N)", '#34d399')
    draw_rel(ax, (85, 35), (142, 50), "attends (1:N)", '#fbbf24', rad=-0.15)

    # Footer
    ax.text(10, 2, "PearlThoughts Internship &bull; 5 Core Entities with Full Clinical & Operational Details", fontsize=8, color='#64748b')
    ax.text(180, 2, "Page 1: Visual ERD", fontsize=8, color='#64748b', ha='right')

    plt.tight_layout()
    pdf.savefig(fig, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

    # -------------------------------------------------------------------------
    # PAGE 2: COMPLETE DATA DICTIONARY TABLE
    # -------------------------------------------------------------------------
    fig2, ax2 = plt.subplots(figsize=(19, 11), dpi=300)
    fig2.patch.set_facecolor('#ffffff')
    ax2.set_facecolor('#ffffff')
    ax2.axis('off')

    # Title
    ax2.text(0.04, 0.96, "SCHEDULA &bull; DATA DICTIONARY & SPECIFICATIONS (5 ENTITIES)", fontsize=16, fontweight='bold', color='#0f172a', transform=ax2.transAxes)
    ax2.text(0.04, 0.93, "Schedule Project Module &bull; Complete Attribute Specifications, Constraints & Relationships", fontsize=10, color='#64748b', transform=ax2.transAxes)

    col_labels = ["Module", "Entity", "Key Columns", "Data Type", "Constraints & References", "Description"]
    table_data = [
        ["1. User", "users", "id, email, phone,\npassword_hash, role,\nauth_provider, is_verified", "UUID, VARCHAR(255),\nVARCHAR(20), BOOLEAN,\nTIMESTAMPTZ", "PK, UNIQUE(email, phone)\nrole: DOCTOR | PATIENT | ADMIN\nauth_provider: LOCAL | GOOGLE", "Central authentication identity;\nmanages passwords, OAuth & OTP verification"],
        ["2. Patient", "patients", "id, user_id, first_name,\nlast_name, date_of_birth,\ngender, blood_group, address,\nmedical_history", "UUID, VARCHAR(100),\nDATE, VARCHAR(20),\nTEXT, TIMESTAMPTZ", "PK, FK -> users(id) UNIQUE (1:1)\nON DELETE CASCADE", "Patient demographic identity,\nemergency contacts, and baseline clinical history"],
        ["3. Doctor", "doctors", "id, user_id, first_name,\nlast_name, specialization,\nlicense_number, fee, bio,\nrating_average, is_approved", "UUID, VARCHAR(100),\nVARCHAR(50), DECIMAL(10,2),\nINT, TEXT, BOOLEAN", "PK, FK -> users(id) UNIQUE (1:1)\nUNIQUE(license_number)", "Doctor professional credentials, verified medical\nlicense, consultation fee, ratings & admin approval"],
        ["4. Availability", "doctor_availability", "id, doctor_id, day_of_week,\nstart_time, end_time,\nslot_duration_minutes,\nmax_capacity, is_active", "UUID, VARCHAR(20),\nTIME, INT,\nBOOLEAN, TIMESTAMPTZ", "PK, FK -> doctors(id)\nON DELETE CASCADE\nmax_capacity >= 1 (Elastic)", "Doctor weekly consultation windows, slot\ndurations, and elastic capacity rules for walk-ins"],
        ["5. Appointment", "appointments", "id, patient_id, doctor_id,\nappointment_date, start_time,\nend_time, status, reason,\ncancellation_reason,\nreschedule_reason", "UUID, DATE, TIME,\nVARCHAR(30), TEXT,\nTIMESTAMPTZ", "PK, FK -> patients(id)\nFK -> doctors(id)\nstatus: SCHED | CONF | CANC | RESCHED", "Core booking transaction capturing scheduled slot,\npatient symptoms, cancellation and reschedule notes"]
    ]

    table = ax2.table(
        cellText=table_data,
        colLabels=col_labels,
        loc='center',
        cellLoc='left',
        colWidths=[0.11, 0.14, 0.22, 0.14, 0.21, 0.18]
    )
    table.auto_set_font_size(False)
    table.set_fontsize(7.8)
    table.scale(1.0, 2.5)

    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_facecolor('#0f172a')
            cell.set_text_props(color='#ffffff', weight='bold')
        else:
            if row % 2 == 0:
                cell.set_facecolor('#f8fafc')
            else:
                cell.set_facecolor('#ffffff')
            cell.set_text_props(color='#1e293b')
        cell.set_edgecolor('#cbd5e1')
        cell.set_linewidth(0.8)

    ax2.text(0.04, 0.04, "PearlThoughts Internship &bull; Schedule Project Module &bull; Page 2: Detailed Data Dictionary", fontsize=8, color='#64748b', transform=ax2.transAxes)

    plt.tight_layout()
    pdf.savefig(fig2, facecolor=fig2.get_facecolor(), edgecolor='none')
    plt.close()

print(f"SUCCESS: Enriched 5-entity PDF generated at {output_pdf}")
