import React from 'react';
import DoctorSidebar from './DoctorSidebar';
import DoctorAvailabilityCalendar from './DoctorAvailabilityCalendar';
import { FiCalendar, FiClock, FiShield } from 'react-icons/fi';

const DoctorSchedule = () => {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <DoctorSidebar activeTab="schedule" />
            
            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#ff5a5f]/10 rounded-2xl">
                                <FiCalendar className="w-8 h-8 text-[#ff5a5f]" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Advanced Schedule</h1>
                                <p className="text-gray-500 mt-1 flex items-center gap-2">
                                    <FiClock className="text-gray-400" />
                                    Manage your professional availability and leaves.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium flex items-center gap-2">
                            <FiShield />
                            Changes are saved instantly
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TipCard 
                            title="Block Dates" 
                            desc="Click on any date to mark it as unavailable for holidays or personal leave."
                            color="bg-red-50"
                            iconColor="text-red-600"
                        />
                        <TipCard 
                            title="Weekly View" 
                            desc="Switch to 'Week' view to manage specific time slots if needed."
                            color="bg-indigo-50"
                            iconColor="text-indigo-600"
                        />
                        <TipCard 
                            title="Patient View" 
                            desc="Patients will see these dates as unavailable in the booking section."
                            color="bg-green-50"
                            iconColor="text-green-600"
                        />
                    </div>

                    {/* Calendar Component */}
                    <DoctorAvailabilityCalendar />
                </div>
            </div>
        </div>
    );
};

const TipCard = ({ title, desc, color, iconColor }) => (
    <div className={`${color} p-4 rounded-2xl border border-white/50 shadow-sm`}>
        <h3 className={`font-bold text-sm ${iconColor} mb-1 uppercase tracking-wider`}>{title}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
    </div>
);

export default DoctorSchedule;
