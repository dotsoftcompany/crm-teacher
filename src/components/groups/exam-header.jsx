import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { useMainContext } from '@/context/main-context';
import { formatDate } from '@/lib/utils';
import {
  Activity,
  Calendar,
  Clock,
  Eclipse,
  FlaskConical,
  Phone,
  User,
} from 'lucide-react';

function ExamHeader({ exam }) {
  const { teachers, courses } = useMainContext();

  return (
    <div className="space-y-2 py-4 w-full border-b border-border">
      <div className="flex items-center gap-2">
        <h1 className="text-lg md:text-xl font-semibold">{exam?.title}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div
          className={`flex items-center gap-1 text-xs md:text-sm capitalize ${
            exam?.place === 'online' ? 'text-green-500' : 'text-yellow-500'
          }`}
        >
          <div
            className={`w-2 h-2 animate-pulse rounded-full ${
              exam?.place === 'online' ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          />
          <span>{exam?.place}</span>
        </div>
        <div
          className={`capitalize ${
            exam?.status === 'ongoing' ? 'text-green-500' : ''
          }
        ${exam?.status === 'upcoming' ? 'text-blue-500' : ''}
        ${exam?.status === 'completed' ? 'text-indigo-500' : ''}
        ${exam?.status === 'cancelled' ? 'text-red-500' : ''}
        ${exam?.status === 'paused' ? 'text-yellow-500' : ''}`}
        >
          <span>
            {exam?.status === 'ongoing' ? 'Davom etmoqda' : ''}
            {exam?.status === 'upcoming' ? 'Kutilmoqda' : ''}
            {exam?.status === 'completed' ? 'Yakuniga yetdi' : ''}
            {exam?.status === 'cancelled' ? 'Bekor qilindi' : ''}
            {exam?.status === 'paused' ? "To'xtatib turilipt" : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{exam?.startDate}</span>
        </div>
        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{exam?.endDate}</span>
        </div>
      </div>
    </div>
  );
}

export default ExamHeader;
