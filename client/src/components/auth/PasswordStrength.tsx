import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
    password?: string;
}

export const PasswordStrength = ({ password = '' }: PasswordStrengthProps) => {
    const rules = [
        { label: '8+ chars', valid: password.length >= 8 },
        { label: 'Uppercase', valid: /[A-Z]/.test(password) },
        { label: 'Lowercase', valid: /[a-z]/.test(password) },
        { label: 'Number', valid: /[0-9]/.test(password) },
        { label: 'Special Char', valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = rules.filter((r) => r.valid).length;

    const getColor = () => {
        if (score <= 1) return 'bg-error';
        if (score <= 3) return 'bg-warning';
        return 'bg-success';
    };

    const width = `${(score / 5) * 100}%`;

    return (
        <div className="space-y-2 mt-2">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className={cn('h-full transition-all duration-300', getColor())}
                    initial={{ width: 0 }}
                    animate={{ width }}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500">
                        {rule.valid ? (
                            <Check className="w-3 h-3 text-success" />
                        ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-300" />
                        )}
                        <span className={cn(rule.valid && 'text-gray-900 font-medium')}>
                            {rule.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
