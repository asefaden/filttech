import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

export interface AlertOptions {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  timer?: number;
  timerProgressBar?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly defaultConfirmButtonColor = '#8B5CF6';
  private readonly defaultCancelButtonColor = '#6B7280';

  /**
   * Show a success alert
   */
  success(
    title: string,
    text?: string,
    options?: Partial<AlertOptions>
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: this.defaultConfirmButtonColor,
      timer: options?.timer ?? 3000,
      timerProgressBar: options?.timerProgressBar ?? true,
      ...options,
    });
  }

  /**
   * Show an error alert
   */
  error(title: string, text?: string, options?: Partial<AlertOptions>): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: this.defaultConfirmButtonColor,
      ...options,
    });
  }

  /**
   * Show a warning alert
   */
  warning(
    title: string,
    text?: string,
    options?: Partial<AlertOptions>
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: this.defaultConfirmButtonColor,
      ...options,
    });
  }

  /**
   * Show an info alert
   */
  info(title: string, text?: string, options?: Partial<AlertOptions>): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: this.defaultConfirmButtonColor,
      ...options,
    });
  }

  /**
   * Show a confirmation dialog
   */
  confirm(
    title: string,

    confirmButtonText = 'Yes',
    cancelButtonText = 'Cancel',
    text?: string
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: this.defaultConfirmButtonColor,
      cancelButtonColor: this.defaultCancelButtonColor,
      confirmButtonText,
      cancelButtonText,
    });
  }

  /**
   * Show a custom alert with full control
   */
  custom(options: any): Promise<SweetAlertResult> {
    return Swal.fire({
      confirmButtonColor: this.defaultConfirmButtonColor,
      cancelButtonColor: this.defaultCancelButtonColor,
      ...options,
    });
  }

  /**
   * Common validation error alerts
   */
  validationError(field: string): Promise<SweetAlertResult> {
    return this.error(`Missing ${field}`, `${field} is required`);
  }

  /**
   * Common submission success alert
   */
  submissionSuccess(action: string): Promise<SweetAlertResult> {
    return this.success('Success!', `${action} successfully!`);
  }

  /**
   * Common submission error alert
   */
  submissionError(action: string, errorMessage?: string): Promise<SweetAlertResult> {
    return this.error(
      `${action} Failed`,
      errorMessage || `Failed to ${action.toLowerCase()}. Please try again.`
    );
  }
}
