import React from 'react';
import { Page } from '../App';
import { LogoIcon, HomeIcon, SettingsIcon } from './icons';
import { UserProgress } from '../types';
import { useTranslation } from '../i18n';
import { calculateLevel } from '../utils/gamification';


interface SidebarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    userProgress: UserProgress;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, userProgress }) => {
    const { t } = useTranslation();
    const { level, progress } = calculateLevel(userProgress.points);

    const navItems = [
        { id: 'home', label: t('navHome'), icon: HomeIcon },
        { id: 'settings', label: t('navSettings'), icon: SettingsIcon },
    ];

    return (
        <aside className="w-16 sm:w-64 bg-slate-900 ring-1 ring-slate-800 flex flex-col">
            <div className="flex items-center justify-center sm:justify-start gap-3 p-4 border-b border-slate-800">
                <LogoIcon className="h-8 w-8 text-cyan-400 shrink-0" />
                <div className="hidden sm:block">
                     <h1 className="text-xl font-bold tracking-tight text-white leading-tight">t<span className="italic">ai</span>me</h1>
                </div>
            </div>

            <nav className="flex-1 mt-6 px-2 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as Page)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activePage === item.id
                                ? 'bg-cyan-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        <item.icon className="h-6 w-6 shrink-0" />
                        <span className="hidden sm:inline">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="hidden sm:block">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-bold text-white">{t('userLevel')} {level}</span>
                        <span className="text-xs text-slate-400">{userProgress.points} {t('totalPoints')}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                 <div className="block sm:hidden text-center">
                    <div className="font-bold text-lg text-white">{level}</div>
                    <div className="text-xs text-slate-400">LVL</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
