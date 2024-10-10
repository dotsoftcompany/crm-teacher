import BreadcrumbComponent from '@/components/breadcrumb';
import { useMainContext } from '@/context/main-context';
import { ChevronRight } from 'lucide-react';
import React from 'react';

function LessonsSchedule() {
  const { groups, courses } = useMainContext();

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const times = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    return `${hour < 10 ? '0' : ''}${hour}:00`;
  });

  // Helper function to get the days based on selectedDay
  const getDaysForSchedule = (selectedDay) => {
    if (selectedDay === 'odd') return ['Monday', 'Wednesday', 'Friday'];
    if (selectedDay === 'even') return ['Tuesday', 'Thursday', 'Saturday'];
    if (selectedDay === 'every_day') return days.slice(0, 6);
    return [];
  };

  // Helper function to check if the current time is in the given range
  const isTimeInRange = (time, range) => {
    const [start, end] = range.split(' - ');
    const startHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    const currentHour = parseInt(time.split(':')[0], 10);
    return currentHour >= startHour && currentHour < endHour;
  };

  // Helper function to assign background color based on selectedDay
  const getBackgroundColor = (selectedDay) => {
    if (selectedDay === 'odd') return 'bg-orange-200 dark:bg-orange-500';
    if (selectedDay === 'even') return 'bg-purple-200 dark:bg-purple-500';
    if (selectedDay === 'every_day') return 'bg-green-200 dark:bg-green-500';
    return '';
  };

  return (
    <div className="px-4 lg:px-8 mx-auto my-4 space-y-4">
      <BreadcrumbComponent title="Dars jadvali" />

      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here&apos;s a list of your tasks for this month!
        </p>
      </div>

      <div className="grid grid-cols-8 gap-x-1.5">
        <div></div>
        {days.map((day) => (
          <div key={day} className="font-semibold text-center p-2 pb-4">
            {day}
          </div>
        ))}

        {/* Time slots and schedule cells */}
        {times.map((time, timeIndex) => (
          <React.Fragment key={time}>
            {/* Time column */}
            <div className="font-semibold text-center bg-accent dark:bg-background border dark:border-none rounded-md p-2">
              {time}
            </div>
            {/* Cells for each day */}
            {days.map((day) => {
              // Find if there's a class scheduled for this time and day
              const groupForDay = groups.find((schedule) => {
                const scheduleDays = getDaysForSchedule(schedule.selectedDay);
                return (
                  scheduleDays.includes(day) &&
                  isTimeInRange(time, schedule.timeInDay)
                );
              });

              if (groupForDay) {
                const isFirstTimeSlot =
                  timeIndex ===
                  times.indexOf(groupForDay.timeInDay.split(' - ')[0]);

                return (
                  <div
                    key={day + time}
                    className={`p-2 h-10 text-center font-semibold cursor-pointer ${getBackgroundColor(
                      groupForDay.selectedDay
                    )} ${isFirstTimeSlot ? 'rounded-t-md' : 'rounded-b-md'}`}
                  >
                    {isFirstTimeSlot ? (
                      <>
                        <div className="flex items-center justify-between rounded-t-md">
                          <div className="flex items-center gap-1">
                            <p className="text-sm">
                              {
                                courses.filter(
                                  (item) => item.id === groupForDay.courseId
                                )[0].courseTitle
                              }
                            </p>
                            <small className="opacity-80">
                              #{groupForDay.groupNumber}
                            </small>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </>
                    ) : (
                      <div></div>
                    )}
                  </div>
                );
              }

              // Render empty cell if no class is scheduled
              return (
                <div
                  key={day + time}
                  className="border rounded-md p-2 h-10"
                ></div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const isTimeInRange = (time, range) => {
  const [start, end] = range.split(' - ');
  return time >= start && time < end;
};

export default LessonsSchedule;
