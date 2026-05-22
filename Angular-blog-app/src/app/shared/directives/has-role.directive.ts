import {
    Directive,
    effect,
    inject,
    Input,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

import { AUTH_SERVICE } from '../../services/auth/auth-service.token';
import { AuthRole } from '../../services/auth/auth.models';

@Directive({
    selector: '[appHasRole]',
    standalone: true,
})
export class HasRoleDirective {
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly authService = inject(AUTH_SERVICE);

    private requiredRoles: AuthRole[] = [];
    private isViewCreated = false;

    @Input()
    public set appHasRole(role: AuthRole | AuthRole[]) {
        this.requiredRoles = Array.isArray(role) ? role : [role];
        this.updateView();
    }

    constructor() {
        effect(() => {
            this.authService.currentUser();
            this.updateView();
        });
    }

    private updateView(): void {
        const canShow = this.requiredRoles.some(role =>
            this.authService.hasRole(role)
        );

        if (canShow && !this.isViewCreated) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
            this.isViewCreated = true;
            return;
        }

        if (!canShow && this.isViewCreated) {
            this.viewContainerRef.clear();
            this.isViewCreated = false;
        }
    }
}