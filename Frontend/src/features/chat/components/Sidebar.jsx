import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Home, 
    Trash2, 
    LogOut,
    MessageSquare,
    X
} from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ onNewChat, onOpenChat, onDeleteChat, currentChatId, onLogout, isOpen, onClose }) => {
    const chats = useSelector((state) => state.chat.chats);
    const user = useSelector((state) => state.auth.user); 

    const sidebarContent = (
        <div className="p-4 flex flex-col h-full">
            {/* Logo & New Thread */}
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <span className="text-bg-secondary font-bold text-xl">SS</span>
                        </div>
                        <span className="text-xl font-semibold tracking-tight">SyncSpace</span>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={() => { onNewChat(); onClose?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                    <Plus className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium">New Thread</span>
                </button>
            </div>

            {/* Main Nav */}
            <nav className="space-y-1 mb-8">
                {[
                    { icon: Home, label: 'Home', active: true },
                ].map((item) => (
                    <button
                        key={item.label}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                            item.active ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                <div className="px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    History
                </div>
                <AnimatePresence initial={false}>
                    {Object.values(chats).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).map((chat) => (
                        <motion.div
                            key={chat.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative"
                        >
                            <button
                                onClick={() => { onOpenChat(chat.id); onClose?.(); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left ${
                                    currentChatId === chat.id 
                                        ? 'bg-white/10 text-white' 
                                        : 'text-text-muted hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <MessageSquare className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-medium truncate pr-6">{chat.title}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer / User */}
            <div className="mt-auto pt-4 border-t border-border-subtle space-y-1">
                <div 
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl mt-2 cursor-pointer hover:bg-white/10 transition-all border border-white/5"
                >
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent to-accent-hover flex items-center justify-center text-bg-secondary font-bold text-xs">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.username}</p>
                        <p className="text-[10px] text-text-muted">Pro Plan</p>
                    </div>
                    <LogOut className="w-4 h-4 text-text-muted hover:text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* ── Desktop sidebar (unchanged) ── */}
            <aside className="hidden md:flex flex-col w-65 h-screen bg-bg-secondary border-r border-border-subtle fixed left-0 top-0 z-20">
                {sidebarContent}
            </aside>

            {/* ── Mobile: backdrop + slide-in drawer ── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.aside
                            key="mobile-sidebar"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 z-40 flex flex-col w-72 h-screen bg-bg-secondary border-r border-border-subtle md:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
