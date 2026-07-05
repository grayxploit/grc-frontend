import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ email: 'user@example.com' })),
            paramMap: of(convertToParamMap({ token: 'sample-token' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
  });

  it('should initialize form values from the route params without throwing', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.resetPasswordForm.get('email')?.value).toBe('user@example.com');
    expect(component.resetPasswordForm.get('token')?.value).toBe('sample-token');
  });
});
