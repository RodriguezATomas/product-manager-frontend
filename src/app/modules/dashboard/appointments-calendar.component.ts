import { Component, OnInit } from '@angular/core';
import { Repair } from '../repairs/models/repair.model';
import { RepairsService } from '../repairs/services/repairs.service';

interface CalendarDay {
  day: number | null;
  date: Date | null;
  isToday: boolean;
  appointmentsCount: number;
}

@Component({
  selector: 'app-appointments-calendar',
  templateUrl: './appointments-calendar.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AppointmentsCalendarComponent implements OnInit {
  readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  readonly currentDate = new Date();
  readonly currentMonth = this.currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  repairs: Repair[] = [];
  calendarDays: CalendarDay[] = [];
  selectedDate = this.currentDate;

  constructor(private repairsService: RepairsService) {}

  get todayRepairs(): Repair[] {
    return this.activeRepairs.filter((repair) => this.isSameDay(new Date(repair.appointmentDate), this.currentDate));
  }

  get monthRepairsCount(): number {
    return this.activeRepairs.filter((repair) => {
      const appointmentDate = new Date(repair.appointmentDate);
      return (
        appointmentDate.getFullYear() === this.currentDate.getFullYear() &&
        appointmentDate.getMonth() === this.currentDate.getMonth()
      );
    }).length;
  }

  get selectedDateRepairs(): Repair[] {
    return this.activeRepairs.filter((repair) => this.isSameDay(new Date(repair.appointmentDate), this.selectedDate));
  }

  get selectedDateLabel(): string {
    return this.selectedDate.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  ngOnInit(): void {
    this.repairsService.getRepairs().subscribe({
      next: (repairs) => {
        this.repairs = repairs;
        this.calendarDays = this.buildCalendarDays();
      },
      error: () => {
        this.repairs = [];
        this.calendarDays = this.buildCalendarDays();
      }
    });
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  selectDay(day: CalendarDay): void {
    if (!day.date || !day.appointmentsCount) {
      return;
    }

    this.selectedDate = day.date;
  }

  private buildCalendarDays(): CalendarDay[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];

    for (let index = 0; index < firstDay; index += 1) {
      days.push({ day: null, date: null, isToday: false, appointmentsCount: 0 });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date,
        isToday: day === this.currentDate.getDate(),
        appointmentsCount: this.activeRepairs.filter((repair) => this.isSameDay(new Date(repair.appointmentDate), date)).length
      });
    }

    return days;
  }

  private get activeRepairs(): Repair[] {
    return this.repairs.filter((repair) => repair.status !== 'completed' && repair.status !== 'cancelled');
  }

  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }
}
