import React from 'react';

export default function InputGlass({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{label}</label>}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
        )}
        <input 
          {...props}
          className={`w-full bg-[#00000040] border border-white/10 rounded-xl py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all shadow-inner ${Icon ? 'pl-12 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  );
}