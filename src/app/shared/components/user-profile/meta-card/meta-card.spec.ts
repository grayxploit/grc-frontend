import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaCard } from './meta-card';
import { User } from '../../../../services/user/user.model';

describe('MetaCard', () => {
  let component: MetaCard;
  let fixture: ComponentFixture<MetaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetaCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MetaCard);
    component = fixture.componentInstance;
    component.user = {
      id: 1,
      email: 'jane@example.com',
      full_name: 'Jane Doe',
      phone: '1234567890',
      status: 'active',
      role: 'user',
      organization: 'ACME',
      facebook: 'https://facebook.com/jane',
      x: 'https://x.com/jane',
      linkedin: 'https://linkedin.com/in/jane',
      instagram: 'https://instagram.com/jane',
    } as User;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a save payload when the form is valid', () => {
    const saveSpy = jasmine.createSpy('saveSpy');
    component.save.subscribe(saveSpy);

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'jane@example.com',
      full_name: 'Jane Doe',
      phone: '1234567890',
    }));
  });
});
