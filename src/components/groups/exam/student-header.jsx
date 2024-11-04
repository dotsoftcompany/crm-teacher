import React from 'react';

import { Badge } from '@/components/ui/badge';
import { CalendarClock, FileDigit, Percent } from 'lucide-react';

function ExamStudentHeader({ student }) {
  function formatDate(timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  }

  return (
    <div className="space-y-2 pb-4 w-full border-b border-border">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-semibold">
          {student?.fullName}
        </h1>
        <Badge variant={true ? 'inactive' : 'active'}>
          {true ? "O'ta olmadi" : "O'ta oldi"}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <p className={student?.results ? 'text-green-500' : 'text-red-500'}>
            {student?.results ? 'Topshirdi' : 'Topshirmadi'}
          </p>
        </div>
        {student?.results && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <p className="text-xs md:text-sm">
              {formatDate(student?.timestamp)}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FileDigit className="h-4 w-4" />
          <p className="text-xs md:text-sm">1/10</p>
        </div>
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4" />
          <p className="text-xs md:text-sm">10%</p>
        </div>
      </div>
    </div>
  );
}

export default ExamStudentHeader;
