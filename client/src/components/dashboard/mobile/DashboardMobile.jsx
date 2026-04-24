import React, { useState, useEffect } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import useAuthStore from '../../../store/useAuthStore';
import DashboardMobileNav from '../../DashboardMobileNav';

// ── Modular Screen Components ──
import MobileOverviewScreen from './MobileOverviewScreen';
import MobileInboxScreen from './MobileInboxScreen';
import MobileGigsScreen from './MobileGigsScreen';
import MobileRequestsScreen from './MobileRequestsScreen';
import MobileOrdersScreen from './MobileOrdersScreen';
import MobileServicesScreen from './MobileServicesScreen';
import MobileProfileScreen from './MobileProfileScreen';
import MobilePaymentsScreen from './MobilePaymentsScreen';
import MobileFavoritesScreen from './MobileFavoritesScreen';
import MobileReviewsScreen from './MobileReviewsScreen';
import MobileHelpScreen from './MobileHelpScreen';
import MobileAdminScreen from './MobileAdminScreen';
import MobileBecomeProviderScreen from './MobileBecomeProviderScreen';
import MobileBookingDetailsScreen from './MobileBookingDetailsScreen';
import MobileChatRoom from './MobileChatRoom';

// ── Modal Components ──
import {
    MobilePaymentModal,
    MobileWithdrawalModal,
    MobileRevisionHistoryModal,
    MobileRevisionModal
} from './MobileDashboardModals';

export default function DashboardMobile(props) {
    const {
        user, role, stats, myGigs, gigsLoading, bookingRequests, bookingsLoading,
        providerStatus,
        profileAvatar, getAvatar, activeTab, setActiveTab,
        gigSearchQuery, setGigSearchQuery, gigTypeFilter, setGigTypeFilter,
        navigate: navProp,
        myBookings, updateBookingStatus,
        profileName, setProfileName, profilePhone, setProfilePhone,
        profileUsername, setProfileUsername,
        providerTitle, providerAbout,
        providerTitleSetter, providerAboutSetter,
        handleSaveProfile, savingProfile, handleAvatarUpload, uploadingAvatar,
        handleEditClick,
        favorites, favoritesLoading, fetchFavorites,
        showRevisions, setShowRevisions, bookingWithRevisions, setBookingWithRevisions,
        withdrawals, withdrawalsLoading, fetchWithdrawals, fetchStats
    } = props;

    const { userLocation } = useAuthStore();
    const navHook = useNav();
    const navigate = navProp || navHook;

    // ── Local state ──
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingForPayment, setBookingForPayment] = useState(null);
    const [bookingForRevision, setBookingForRevision] = useState(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState('Bank Transfer');
    const [withdrawalDetails, setWithdrawalDetails] = useState('');

    // ── Gig filter ──
    const filteredGigs = (myGigs || []).filter(gig => {
        const title = (gig?.title || '').toLowerCase();
        const category = (gig?.category || '').toLowerCase();
        const query = (gigSearchQuery || '').toLowerCase();
        const matchesSearch = title.includes(query) || category.includes(query);
        const matchesType = gigTypeFilter === 'all' || gig?.businessType === gigTypeFilter;
        return matchesSearch && matchesType;
    });

    // ── Booking Handlers ──
    const handleDeliverClick = (booking) => setBookingForPayment(booking);
    const handleShowRevisions = (booking) => { setBookingWithRevisions(booking); setShowRevisions(true); };
    const handleRequestRevision = (booking) => { setBookingForRevision(booking); setRevisionNote(''); };

    const submitRevision = async () => {
        if (!bookingForRevision || !revisionNote.trim()) return;
        try {
            await updateBookingStatus(bookingForRevision._id, 'revision_requested', revisionNote);
            setBookingForRevision(null);
            setRevisionNote('');
        } catch (err) { console.error(err); }
    };

    const confirmDelivery = async (paymentMode) => {
        if (!bookingForPayment) return;
        try {
            await updateBookingStatus(bookingForPayment._id, 'delivered', '', paymentMode);
            setBookingForPayment(null);
            setSelectedBooking(null);
        } catch (err) { console.error(err); }
    };

    const handleWithdrawRequest = async () => {
        if (!withdrawalAmount || isNaN(withdrawalAmount) || Number(withdrawalAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        const available = (stats.totalEarnings || 0) - (stats.withdrawnAmount || 0) - (stats.pendingWithdrawnAmount || 0);
        if (Number(withdrawalAmount) > available) {
            toast.error('Insufficient balance');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post('/api/withdrawals', {
                amount: Number(withdrawalAmount),
                method: withdrawalMethod,
                details: withdrawalDetails
            }, config);
            toast.success('Withdrawal request submitted');
            setShowWithdrawModal(false);
            setWithdrawalAmount('');
            setWithdrawalDetails('');
            fetchWithdrawals?.();
            fetchStats?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting request');
        }
    };

    // ── Auto-open chat if provider/service ID in URL ──
    useEffect(() => {
        const provId = new URLSearchParams(window.location.search).get('provider');
        if (provId && activeTab === 'chat' && !selectedRoom) {
            const fetchAndOpen = async () => {
                try {
                    const { data: provUser } = await api.get(`/api/users/${provId}`);
                    const ids = [user._id, provId].sort();
                    const rId = `direct_${ids[0]}_${ids[1]}`;
                    setSelectedRoom({ roomId: rId, otherUser: provUser, title: 'Inquiry', type: 'Direct' });
                } catch (err) { console.error(err); }
            };
            fetchAndOpen();
        }
    }, [activeTab]);

    // ── Screen Routing ──
    const renderScreen = () => {
        // Priority overrides: chat room & booking detail
        if (selectedRoom) {
            return <MobileChatRoom user={user} room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
        }

        if (selectedBooking) {
            return (
                <MobileBookingDetailsScreen
                    booking={selectedBooking}
                    userLocation={userLocation}
                    onBack={() => setSelectedBooking(null)}
                    onMessage={() => {
                        setSelectedRoom({
                            roomId: selectedBooking._id,
                            otherUser: role === 'provider' ? selectedBooking.user : selectedBooking.provider
                        });
                        setSelectedBooking(null);
                    }}
                    role={role}
                    updateBookingStatus={updateBookingStatus}
                    onDeliverClick={handleDeliverClick}
                    navigate={navigate}
                    onShowRevisions={handleShowRevisions}
                />
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <MobileOverviewScreen
                        user={user} role={role} stats={stats} myGigs={myGigs} myBookings={myBookings}
                        providerTitle={providerTitle} providerAbout={providerAbout}
                        profileAvatar={profileAvatar} getAvatar={getAvatar}
                        setActiveTab={setActiveTab} navigate={navigate}
                        onShowRevisions={handleShowRevisions}
                    />
                );

            case 'chat':
                return (
                    <MobileInboxScreen user={user} setActiveTab={setActiveTab} onSelectRoom={setSelectedRoom} />
                );

            case 'mygigs':
                return (
                    <MobileGigsScreen
                        filteredGigs={filteredGigs} gigSearchQuery={gigSearchQuery} setGigSearchQuery={setGigSearchQuery}
                        gigTypeFilter={gigTypeFilter} setGigTypeFilter={setGigTypeFilter}
                        gigsLoading={gigsLoading} setActiveTab={setActiveTab} navigate={navigate}
                        handleEditClick={handleEditClick} providerStatus={providerStatus}
                    />
                );

            case 'requests':
                return (
                    <MobileRequestsScreen
                        bookingRequests={bookingRequests} bookingsLoading={bookingsLoading}
                        updateBookingStatus={updateBookingStatus} setActiveTab={setActiveTab}
                        navigate={navigate} onSelectRoom={setSelectedRoom} onSelectBooking={setSelectedBooking}
                        onDeliverClick={handleDeliverClick} onShowRevisions={handleShowRevisions}
                    />
                );

            case 'bookings':
                return (
                    <MobileOrdersScreen
                        myBookings={myBookings} bookingsLoading={bookingsLoading}
                        updateBookingStatus={updateBookingStatus} setActiveTab={setActiveTab}
                        navigate={navigate} onSelectRoom={setSelectedRoom} onSelectBooking={setSelectedBooking}
                        onShowRevisions={handleShowRevisions} onRequestRevision={handleRequestRevision}
                    />
                );

            case 'services':
                return <MobileServicesScreen {...props} setActiveTab={setActiveTab} />;

            case 'payments':
                return (
                    <MobilePaymentsScreen
                        stats={stats} bookingRequests={bookingRequests} setActiveTab={setActiveTab}
                        onWithdrawClick={() => setShowWithdrawModal(true)}
                        withdrawals={withdrawals} withdrawalsLoading={withdrawalsLoading}
                    />
                );

            case 'profile':
                return (
                    <MobileProfileScreen
                        user={user} profileAvatar={profileAvatar} getAvatar={getAvatar}
                        profileName={profileName} setProfileName={setProfileName}
                        profilePhone={profilePhone} setProfilePhone={setProfilePhone}
                        profileUsername={profileUsername} setProfileUsername={setProfileUsername}
                        providerTitle={providerTitle} providerAbout={providerAbout}
                        providerTitleSetter={providerTitleSetter} providerAboutSetter={providerAboutSetter}
                        handleSaveProfile={handleSaveProfile} savingProfile={savingProfile}
                        uploadingAvatar={uploadingAvatar} handleAvatarUpload={handleAvatarUpload}
                        role={role} setActiveTab={setActiveTab}
                    />
                );

            case 'favorites':
                return (
                    <MobileFavoritesScreen
                        favorites={favorites} favoritesLoading={favoritesLoading} fetchFavorites={fetchFavorites}
                        setActiveTab={setActiveTab} navigate={navigate} user={user}
                    />
                );

            case 'reviews':
                return <MobileReviewsScreen user={user} role={role} setActiveTab={setActiveTab} navigate={navigate} />;

            case 'help':
                return <MobileHelpScreen setActiveTab={setActiveTab} />;

            case 'admin':
                return (
                    <MobileAdminScreen
                        allUsers={props.allUsers} usersLoading={props.usersLoading}
                        handleUpdateUserRole={props.handleUpdateUserRole} handleToggleUserBan={props.handleToggleUserBan}
                        setActiveTab={setActiveTab}
                    />
                );

            case 'become_provider':
                return (
                    <MobileBecomeProviderScreen
                        handleApplyProvider={props.handleApplyProvider}
                        isSubmitting={props.isSubmitting}
                        setActiveTab={setActiveTab}
                    />
                );

            default:
                return (
                    <MobileOverviewScreen
                        user={user} role={role} stats={stats} myGigs={myGigs} myBookings={myBookings}
                        providerTitle={providerTitle} providerAbout={providerAbout}
                        profileAvatar={profileAvatar} getAvatar={getAvatar}
                        setActiveTab={setActiveTab} navigate={navigate}
                        onShowRevisions={handleShowRevisions}
                    />
                );
        }
    };

    return (
        <div style={{ minHeight: '100dvh', backgroundColor: '#faf8ff', fontFamily: 'Inter, sans-serif' }}>
            {renderScreen()}

            <MobileRevisionHistoryModal
                isOpen={showRevisions}
                onClose={() => setShowRevisions(false)}
                revisions={bookingWithRevisions?.revisions || []}
            />
            <MobileRevisionModal
                isOpen={!!bookingForRevision}
                onClose={() => setBookingForRevision(null)}
                onSubmit={submitRevision}
                note={revisionNote}
                setNote={setRevisionNote}
            />
            <MobilePaymentModal
                isOpen={!!bookingForPayment}
                onClose={() => setBookingForPayment(null)}
                onSelect={confirmDelivery}
            />
            <MobileWithdrawalModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onSubmit={handleWithdrawRequest}
                amount={withdrawalAmount}
                setAmount={setWithdrawalAmount}
                availableBalance={(stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0) - (stats?.pendingWithdrawnAmount || 0)}
                method={withdrawalMethod}
                setMethod={setWithdrawalMethod}
                details={withdrawalDetails}
                setDetails={setWithdrawalDetails}
            />

            <DashboardMobileNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={role}
                navigate={navigate}
            />
        </div>
    );
}
