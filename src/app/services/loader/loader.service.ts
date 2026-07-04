import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Service()
export class LoaderService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    show() {
        this.loadingSubject.next(true);
    }

    hide() {
        this.loadingSubject.next(false);
    }
}
