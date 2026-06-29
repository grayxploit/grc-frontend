import { SafeHtmlPipePipe } from './safe-html-pipe';

describe('SafeHtmlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipePipe({
      bypassSecurityTrustHtml: (value: string) => value,
    } as any);
    expect(pipe).toBeTruthy();
  });
});
