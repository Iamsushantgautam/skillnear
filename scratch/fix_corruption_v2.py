
import os
import sys

file_path = r'd:\My Project\SkillNear Project\skillnear\client\src\components\dashboard\desktop\DashboardDesktop.jsx'

try:
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        sys.exit(1)

    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    print(f"Read {len(lines)} lines.")

    # Find the markers
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if 'Stats Cards' in line and i > 2400:
            start_idx = i
        if 'Transaction History' in line and i > 2500:
            end_idx = i
            break

    if start_idx == -1 or end_idx == -1:
        print(f"Error: Markers not found. start_idx={start_idx}, end_idx={end_idx}")
        # Fallback to hardcoded indices if markers fail
        start_idx = 2473
        end_idx = 2507

    print(f"Replacing lines from {start_idx+1} to {end_idx}")

    block = [
        "                        {/* Stats Cards */}\n",
        "                        <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>\n",
        "                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>\n",
        "                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n",
        "                                    <BarChart size={20} />\n",
        "                                </div>\n",
        "                                <div>\n",
        "                                    <p style={{ fontSize: '11px', color: '#737685', fontWeight: '700', textTransform: 'uppercase' }}>{role === 'provider' ? 'Gross Earnings' : 'Total Portfolio'}</p>\n",
        "                                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? (stats?.grossEarnings || 0).toLocaleString() : (stats?.totalEarnings || 0).toLocaleString()}</h4>\n",
        "                                    <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>(Paid + Pending)</p>\n",
        "                                </div>\n",
        "                            </div>\n",
        "                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>\n",
        "                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n",
        "                                    <ArrowDownLeft size={20} />\n",
        "                                </div>\n",
        "                                <div>\n",
        "                                    <p style={{ fontSize: '11px', color: '#737685', fontWeight: '700', textTransform: 'uppercase' }}>{role === 'provider' ? 'Total Withdrawn' : 'Spent'}</p>\n",
        "                                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? (stats?.withdrawnAmount || 0).toLocaleString() : '0'}</h4>\n",
        "                                </div>\n",
        "                            </div>\n",
        "                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>\n",
        "                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n",
        "                                    <Clock size={20} />\n",
        "                                </div>\n",
        "                                <div>\n",
        "                                    <p style={{ fontSize: '11px', color: '#737685', fontWeight: '700', textTransform: 'uppercase' }}>{role === 'provider' ? 'Pending Payout' : 'Owed'}</p>\n",
        "                                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? (stats?.pendingWithdrawnAmount || 0).toLocaleString() : '0'}</h4>\n",
        "                                </div>\n",
        "                            </div>\n",
        "                        </div>\n",
        "                    </div>\n",
        "\n",
        "                    <div style={{ display: 'grid', gridTemplateColumns: role === 'provider' ? '1fr 1fr' : '1fr', gap: '24px' }}>\n",
        "                        {/* Transaction History */}\n"
    ]

    lines[start_idx:end_idx+1] = block

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print("File fixed successfully.")

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
