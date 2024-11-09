import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMainContext } from '@/context/main-context';
import { formatDate } from '@/lib/utils';

function GroupCard({ card }) {
  const { courses, teacherData } = useMainContext();
  return (
    <Card key={card.id} className="group-card group-dark-card">
      <div className="p-4 pb-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant={
                      card.selectedDay === 'odd'
                        ? 'odd'
                        : card.selectedDay === 'even'
                        ? 'even'
                        : 'every'
                    }
                  >
                    {card.timeInDay}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs font-medium text-accent-foreground">
                    {card.selectedDay === 'odd'
                      ? 'Du - Chor - Jum'
                      : card.selectedDay === 'even'
                      ? 'Se - Pay - Shan'
                      : 'Har kuni'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant={card.status ? 'active' : 'inactive'}>
              {card?.status ? 'Aktiv' : 'Tugatildi'}
            </Badge>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-semibold">
              {
                courses.filter((item) => item.id === card.courseId)[0]
                  .courseTitle
              }
            </h2>
            <span className="text-base text-muted-foreground">
              #{card.groupNumber}
            </span>
          </div>

          <div className="flex gap-0 mt-2">
            <Badge className="text-sm px-2 font-medium" variant="secondary">
              Talabalar:
              {card?.students?.length ? ` ${card?.students?.length} ta` : ' 0'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-3 px-4 mt-4 border-t border-border">
        <div className="flex items-center gap-2 w-52">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={teacherData.fullName}
              alt={teacherData.fullName}
            />
            <AvatarFallback className="text-xs">
              {teacherData?.fullName
                ?.split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'N/A'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">
            {teacherData.fullName}
          </span>
        </div>
        <small className="text-sm px-2 font-medium text-muted-foreground">
          {formatDate(card.startDate)}
        </small>
      </div>
    </Card>
  );
}

export default GroupCard;
