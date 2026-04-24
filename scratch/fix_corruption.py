
import os

file_path = r'd:\My Project\SkillNear Project\skillnear\client\src\components\dashboard\desktop\DashboardDesktop.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 2480 (index 2479)
new_line_2480 = "                                    <p style={{ fontSize: '11px', color: '#737685', fontWeight: '700', textTransform: 'uppercase' }}>{role === 'provider' ? 'Gross Earnings' : 'Total Portfolio'}</p>\n"
new_line_2481 = "                                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? (stats?.grossEarnings || 0).toLocaleString() : (stats?.totalEarnings || 0).toLocaleString()}</h4>\n"

# Line 2499 (index 2498)
new_line_2499 = "                                    <p style={{ fontSize: '11px', color: '#737685', fontWeight: '700', textTransform: 'uppercase' }}>{role === 'provider' ? 'Pending Payout' : 'Owed'}</p>\n"
new_line_2500 = "                                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? (stats?.pendingWithdrawnAmount || 0).toLocaleString() : '0'}</h4>\n"

# We need to find the exact range to replace.
# Based on the corrupted_lines.txt:
# Line 10 (index 2479) was:
# <p style={{ fontSize: '11px', color: '#737685', fontWeight: '700', textTransfor                                     <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>â‚¹{role === 'provider' ? (stats?.grossEarnings || 0).toLocaleString() : (stats?.totalEarnings || 0).toLocaleString()}</h4>
# It seems it merged two lines.

# Let's just rewrite the whole block from index 2473 to 2503.
start_idx = 2473
end_idx = 2503

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
    "                    </div>\n"
]

lines[start_idx:end_idx+1] = block

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("File fixed successfully.")
