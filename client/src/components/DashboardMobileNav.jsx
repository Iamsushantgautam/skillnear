import {
    LayoutDashboard, Briefcase, MessageSquare, Wallet, User, LogOut, ShoppingBag
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const PC = '#003d9b';

const NAV_TABS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Home' },
    { id: 'chat', icon: MessageSquare, label: 'Inbox' },
    { id: 'requests', icon: Briefcase, label: 'Jobs', providerOnly: true },
    { id: 'bookings', icon: ShoppingBag, label: 'Orders', customerOnly: true },
    { id: 'payments', icon: Wallet, label: 'Wallet', providerOnly: true },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'exit', icon: LogOut, label: 'Exit' },
];

const DashboardMobileNav = ({ activeTab, setActiveTab, role, navigate }) => {
    const { logout } = useAuthStore();

    const visibleTabs = NAV_TABS.filter(t => {
        if (t.providerOnly && role !== 'provider') return false;
        if (t.customerOnly && role === 'provider') return false;
        return true;
    });

    const handleAction = (id) => {
        if (id === 'exit') {
            navigate('/');
        } else {
            setActiveTab(id);
        }
    };

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 72,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1000,
            boxShadow: '0 -4px 25px rgba(0,0,0,0.08)',
            borderRadius: '24px 24px 0 0',
            padding: '0 8px'
        }}>
            {visibleTabs.map(({ id, icon: Icon, label }) => {
                if (!Icon) return null;
                const isActive = activeTab === id;
                const isExit = id === 'exit';
                return (
                    <button
                        key={id}
                        onClick={() => handleAction(id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            flex: 1,
                            padding: '10px 0',
                            transition: 'all 0.2s',
                            opacity: isExit ? 0.7 : 1
                        }}
                    >
                        <Icon size={18} color={isActive ? PC : isExit ? '#ef4444' : '#94a3b8'} strokeWidth={isActive ? 2.5 : 2} />
                        <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: isActive ? PC : isExit ? '#ef4444' : '#94a3b8',
                            marginTop: 4
                        }}>{label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default DashboardMobileNav;
