import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AUTH_SERVICE } from '../../../services/auth/auth-service.token';

@Component({
    selector: 'app-auth-dialog',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './auth-dialog.html',
    styleUrl: './auth-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthDialog {
    private readonly authService = inject(AUTH_SERVICE);
    private readonly dialogRef = inject(MatDialogRef<AuthDialog>);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly isRegisterMode = signal(false);
    protected readonly isSubmitting = signal(false);
    protected readonly requestError = signal<string | null>(null);

    protected readonly form = new FormGroup({
        login: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        email: new FormControl('', {
            nonNullable: true,
        }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(6)],
        }),
    });

    protected closeDialog(): void {
        this.dialogRef.close(false);
    }

    protected switchToLogin(): void {
        this.isRegisterMode.set(false);
        this.requestError.set(null);
        this.form.controls.email.clearValidators();
        this.form.controls.email.updateValueAndValidity();
    }

    protected switchToRegister(): void {
        this.isRegisterMode.set(true);
        this.requestError.set(null);
        this.form.controls.email.setValidators([
            Validators.required,
            Validators.email,
        ]);
        this.form.controls.email.updateValueAndValidity();
    }

    protected submitForm(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.requestError.set(null);
        this.isSubmitting.set(true);

        const login = this.form.controls.login.value.trim();
        const email = this.form.controls.email.value.trim();
        const password = this.form.controls.password.value;

        const request = this.isRegisterMode()
            ? this.authService.register({
                username: login,
                email,
                password,
            })
            : this.authService.login({
                login,
                password,
            });

        request
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.dialogRef.close(true);
                },
                error: error => {
                    console.error('Auth request failed:', error);
                    this.requestError.set(
                        error?.error?.message ??
                        error?.message ??
                        'Не удалось выполнить запрос'
                    );
                    this.isSubmitting.set(false);
                },
            });
    }
}