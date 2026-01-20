import React from 'react';

interface OverviewTabProps {
    user: any;
    onNavigate: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ user, onNavigate }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-serif text-[#2B1E16] mb-2">My Overview</h2>
                <p className="text-[#8A8A8A]">Welcome to your private client lounge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Stats / Latest Order Preview could go here */}
                <div
                    onClick={() => onNavigate('orders')}
                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[#F7F4EF]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-lg text-[#2B1E16]">Recent Order</h3>
                        <span className="text-[#C9A45C] text-sm group-hover:underline">View History &rarr;</span>
                    </div>
                    <p className="text-[#8A8A8A] text-sm">Check the status of your most recent bespoke acquisitions.</p>
                </div>

                <div
                    onClick={() => onNavigate('settings')}
                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[#F7F4EF]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-lg text-[#2B1E16]">Account Details</h3>
                        <span className="text-[#C9A45C] text-sm group-hover:underline">Manage Profile &rarr;</span>
                    </div>
                    <p className="text-[#8A8A8A] text-sm text-ellipsis overflow-hidden">
                        {user?.firstName} {user?.lastName}<br />
                        {user?.email}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
