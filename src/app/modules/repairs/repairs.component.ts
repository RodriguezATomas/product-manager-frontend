import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { Repair, RepairPayload } from './models/repair.model';
import { RepairsService } from './services/repairs.service';

interface AvailableDate {
  label: string;
  day: number;
  date: Date;
  disabled: boolean;
}

@Component({
  selector: 'app-repairs',
  templateUrl: './repairs.component.html',
  styleUrls: ['./repairs.component.css']
})
export class RepairsComponent implements OnInit {
  private readonly dismissedReadyRepairsKey = 'dismissedReadyRepairs';
  repairs: Repair[] = [];
  confirmedRepair: Repair | null = null;
  dismissedReadyRepairIds: string[] = [];
  availableDates: AvailableDate[] = [];
  selectedDate: Date | null = null;
  selectedTime = '';
  bookedTimes: string[] = [];
  currentCalendarDate = new Date();
  readonly timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
  loading = false;
  saving = false;

  repairForm = this.fb.group({
    customer: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    product: this.fb.group({
      type: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      problemDescription: ['', Validators.required]
    }),
    appointmentDate: ['', Validators.required]
  });

  constructor(
    private authService: AuthService,
    private repairsService: RepairsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.dismissedReadyRepairIds = this.getDismissedReadyRepairIds();
    this.buildAvailableDates();
    this.loadRepairs();
  }

  get currentMonthLabel(): string {
    return new Intl.DateTimeFormat('es-AR', {
      month: 'long',
      year: 'numeric'
    }).format(this.currentCalendarDate);
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) {
      return 'Selecciona un dia y horario';
    }

    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(this.selectedDate);
  }

  get selectedAppointmentLabel(): string {
    if (!this.selectedDate || !this.selectedTime) {
      return 'Sin turno seleccionado';
    }

    return `${this.selectedDateLabel} a las ${this.formatTime(this.selectedTime)}`;
  }

  get availableTimeSlots(): string[] {
    return this.timeSlots.filter((time) => !this.isTimeBooked(time));
  }

  get readyRepairs(): Repair[] {
    return this.repairs.filter((repair) => repair.status === 'completed' && !this.dismissedReadyRepairIds.includes(repair._id));
  }

  get visibleRepairs(): Repair[] {
    return this.isAdmin ? this.repairs : this.repairs.filter((repair) => repair.status !== 'completed');
  }

  previousMonth(): void {
    this.currentCalendarDate = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() - 1, 1);
    this.buildAvailableDates();
  }

  nextMonth(): void {
    this.currentCalendarDate = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() + 1, 1);
    this.buildAvailableDates();
  }

  selectDate(day: AvailableDate): void {
    if (day.disabled) {
      return;
    }

    this.selectedDate = day.date;
    this.selectedTime = '';
    this.updateAppointmentDate();
    this.loadBookedTimes(day.date);
  }

  selectTime(time: string): void {
    if (this.isTimeBooked(time)) {
      return;
    }

    this.selectedTime = time;
    this.updateAppointmentDate();
  }

  isSelectedDate(day: AvailableDate): boolean {
    return Boolean(
      this.selectedDate &&
      this.selectedDate.getFullYear() === day.date.getFullYear() &&
      this.selectedDate.getMonth() === day.date.getMonth() &&
      this.selectedDate.getDate() === day.date.getDate()
    );
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  isTimeBooked(time: string): boolean {
    return this.bookedTimes.includes(time) || this.getBookedTimesFromRepairs().includes(time);
  }

  submitRepair(): void {
    if (this.repairForm.invalid) {
      this.repairForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.repairsService.createRepair(this.repairForm.getRawValue() as RepairPayload).pipe(
      finalize(() => {
        this.saving = false;
      })
    ).subscribe({
      next: (repair) => {
        this.confirmedRepair = repair;
        this.repairForm.reset();
        this.selectedDate = null;
        this.selectedTime = '';
        this.bookedTimes = [];
        this.loadRepairs();
      },
      error: (error) => this.showRequestError(error, 'No se pudo reservar el turno.')
    });
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  trackByRepair(_: number, repair: Repair): string {
    return repair._id;
  }

  cancelRepair(repair: Repair): void {
    this.repairsService.cancelRepair(repair._id).subscribe({
      next: () => {
        this.snackBar.open('Turno cancelado correctamente.', 'Cerrar', { duration: 3000 });
        this.loadRepairs();
      },
      error: (error) => this.showRequestError(error, 'No se pudo cancelar el turno.')
    });
  }

  deleteRepair(repair: Repair): void {
    this.repairsService.deleteRepair(repair._id).subscribe({
      next: () => {
        this.snackBar.open('Turno eliminado correctamente.', 'Cerrar', { duration: 3000 });
        this.loadRepairs();
      },
      error: (error) => this.showRequestError(error, 'No se pudo eliminar el turno.')
    });
  }

  dismissReadyMessage(repair: Repair): void {
    this.dismissedReadyRepairIds = [...new Set([...this.dismissedReadyRepairIds, repair._id])];
    localStorage.setItem(this.dismissedReadyRepairsKey, JSON.stringify(this.dismissedReadyRepairIds));
  }

  markRepairReady(repair: Repair): void {
    this.repairsService.markRepairReady(repair._id).subscribe({
      next: () => {
        this.snackBar.open('Se aviso que la reparacion esta lista.', 'Cerrar', { duration: 3000 });
        this.loadRepairs();
      },
      error: (error) => this.showRequestError(error, 'No se pudo avisar que la reparacion esta lista.')
    });
  }

  archiveRepair(repair: Repair): void {
    this.repairsService.archiveRepair(repair._id).subscribe({
      next: () => {
        this.snackBar.open('Turno limpiado correctamente.', 'Cerrar', { duration: 3000 });
        this.loadRepairs();
      },
      error: (error) => this.showRequestError(error, 'No se pudo limpiar el turno.')
    });
  }

  private loadRepairs(): void {
    this.loading = true;
    this.repairsService.getRepairs().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (repairs) => {
        this.repairs = repairs;
        if (this.selectedTime && this.isTimeBooked(this.selectedTime)) {
          this.selectedTime = '';
          this.updateAppointmentDate();
        }
      },
      error: (error) => {
        this.repairs = [];
        this.showRequestError(error, 'No se pudieron cargar los turnos.');
      }
    });
  }

  private loadBookedTimes(date: Date): void {
    this.repairsService.getBookedTimes(this.formatDateParam(date)).subscribe({
      next: (bookedTimes) => {
        this.bookedTimes = bookedTimes;
        if (this.selectedTime && this.isTimeBooked(this.selectedTime)) {
          this.selectedTime = '';
          this.updateAppointmentDate();
        }
      },
      error: () => {
        this.bookedTimes = [];
      }
    });
  }

  private showRequestError(error: any, fallbackMessage: string): void {
    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }

  private buildAvailableDates(): void {
    const dates: AvailableDate[] = [];
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekDay = firstDay.getDay() || 7;
    const calendarStart = new Date(year, month, 2 - firstWeekDay);

    for (let index = 0; index < 35; index += 1) {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + index);
      date.setHours(0, 0, 0, 0);
      const day = date.getDay();
      const isCurrentMonth = date.getMonth() === month;
      const isPastDate = date < this.startOfToday();

      dates.push({
        label: String(date.getDate()),
        day: date.getDate(),
        date,
        disabled: !isCurrentMonth || isPastDate || day === 0 || day === 6
      });
    }

    this.availableDates = dates;
  }

  private updateAppointmentDate(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.repairForm.patchValue({ appointmentDate: '' });
      return;
    }

    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    const appointmentDate = new Date(this.selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);
    this.repairForm.patchValue({ appointmentDate: appointmentDate.toISOString() });
  }

  private formatDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getBookedTimesFromRepairs(): string[] {
    if (!this.selectedDate) {
      return [];
    }

    return this.repairs
      .filter((repair) => repair.status !== 'cancelled')
      .filter((repair) => this.formatDateParam(new Date(repair.appointmentDate)) === this.formatDateParam(this.selectedDate as Date))
      .map((repair) => {
        const appointmentDate = new Date(repair.appointmentDate);
        const hours = String(appointmentDate.getHours()).padStart(2, '0');
        const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      });
  }

  private getDismissedReadyRepairIds(): string[] {
    try {
      const savedIds = JSON.parse(localStorage.getItem(this.dismissedReadyRepairsKey) || '[]');
      return Array.isArray(savedIds) ? savedIds.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}
