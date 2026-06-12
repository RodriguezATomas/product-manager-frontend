import { Component } from '@angular/core';

interface CalendarDay {
  day: number | null;
  isToday: boolean;
}

@Component({
  selector: 'app-appointments-calendar',
  templateUrl: './appointments-calendar.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AppointmentsCalendarComponent {
  readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  readonly currentDate = new Date();
  readonly currentMonth = this.currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  readonly calendarDays = this.buildCalendarDays();

  private buildCalendarDays(): CalendarDay[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];

    for (let index = 0; index < firstDay; index += 1) {
      days.push({ day: null, isToday: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({
        day,
        isToday: day === this.currentDate.getDate()
      });
    }

    return days;
  }
}
