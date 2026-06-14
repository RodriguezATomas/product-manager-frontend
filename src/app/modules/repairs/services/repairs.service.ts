import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Repair, RepairPayload } from '../models/repair.model';

@Injectable({
  providedIn: 'root'
})
export class RepairsService {
  constructor(private http: HttpClient) {}

  getRepairs(): Observable<Repair[]> {
    return this.http.get<unknown>(`${environment.apiUrl}/v1/repairs`).pipe(
      map((response) => this.normalizeRepairsResponse(response))
    );
  }

  createRepair(payload: RepairPayload): Observable<Repair> {
    return this.http.post<unknown>(`${environment.apiUrl}/v1/repairs`, payload).pipe(
      map((response) => this.normalizeRepair(this.extractEntity(response)))
    );
  }

  getBookedTimes(date: string): Observable<string[]> {
    return this.http.get<{ bookedTimes: string[] }>(`${environment.apiUrl}/v1/repairs/availability`, {
      params: { date }
    }).pipe(
      map((response) => response.bookedTimes || [])
    );
  }

  cancelRepair(repairId: string): Observable<Repair> {
    return this.http.patch<unknown>(`${environment.apiUrl}/v1/repairs/${repairId}`, { status: 'cancelled' }).pipe(
      map((response) => this.normalizeRepair(this.extractEntity(response)))
    );
  }

  markRepairReady(repairId: string): Observable<Repair> {
    return this.http.patch<unknown>(`${environment.apiUrl}/v1/repairs/${repairId}`, { status: 'completed' }).pipe(
      map((response) => this.normalizeRepair(this.extractEntity(response)))
    );
  }

  archiveRepair(repairId: string): Observable<Repair> {
    return this.http.patch<unknown>(`${environment.apiUrl}/v1/repairs/${repairId}`, { status: 'archived' }).pipe(
      map((response) => this.normalizeRepair(this.extractEntity(response)))
    );
  }

  deleteRepair(repairId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/v1/repairs/${repairId}`);
  }

  private normalizeRepairsResponse(response: unknown): Repair[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeRepair(item));
    }

    const data = this.extractEntity(response) as Record<string, unknown>;
    const rawItems = this.asArray(data['results'] ?? data['items'] ?? data['repairs'] ?? data['data'] ?? []);
    return rawItems.map((item) => this.normalizeRepair(item));
  }

  private normalizeRepair(source: any): Repair {
    return {
      _id: String(source?.id ?? source?._id ?? ''),
      customer: {
        name: String(source?.customer?.name ?? ''),
        email: String(source?.customer?.email ?? ''),
        phone: String(source?.customer?.phone ?? '')
      },
      product: {
        type: String(source?.product?.type ?? ''),
        brand: String(source?.product?.brand ?? ''),
        model: String(source?.product?.model ?? ''),
        serialNumber: String(source?.product?.serialNumber ?? ''),
        problemDescription: String(source?.product?.problemDescription ?? '')
      },
      appointmentDate: String(source?.appointmentDate ?? ''),
      status: String(source?.status ?? 'pending'),
      adminNotes: source?.adminNotes ? String(source.adminNotes) : undefined,
      createdAt: source?.createdAt ? String(source.createdAt) : undefined,
      user: source?.user
    };
  }

  private extractEntity(response: unknown): unknown {
    if (!response || typeof response !== 'object') {
      return response;
    }

    const record = response as Record<string, unknown>;
    return record['repair'] ?? record['data'] ?? record['result'] ?? response;
  }

  private asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }
}
