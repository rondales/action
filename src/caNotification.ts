'use strict';

class CANotification {

  private diagCount: number;
  private done: boolean;
  private vulnerabilityCount: number;
  private advisoryCount: number;
  private exploitCount: number;
  private depCount: number;
  private uri: string;
  private text: string;
  private cacheHitCount: number;
  private cacheMissCount: number;
  constructor(respData: any) {
    this.diagCount = respData.diagCount || 0;
    this.done = respData.done === true;
    this.cacheHitCount = respData.cacheHitCount || 0;
    this.cacheMissCount = respData.cacheMissCount || 0;
    const vulnCount = respData.vulnCount || { vulnerabilityCount: 0, advisoryCount: 0, exploitCount: 0 };
    this.vulnerabilityCount = vulnCount.vulnerabilityCount;
    this.advisoryCount = vulnCount.advisoryCount;
    this.exploitCount = vulnCount.exploitCount;
    this.depCount = respData.depCount || 0;
    this.uri = respData.uri;
    this.text = respData.data;
  }

  public origin(): string {
    return this.uri;
  }

  public isDone(): boolean {
    return this.done;
  }

  public didCallBackend(): boolean {
    return this.cacheMissCount > 0;
  }

  public hasWarning(): boolean {
    return this.diagCount > 0;
  }

  public popupText(): string {
    // replace texts inside $(..)
    return this.statusText().replace(/\$\((.*?)\)/g, '');
  }

  private vulnCountText(): string {
    const vulns = this.vulnerabilityCount + this.advisoryCount;
    return vulns > 0 ? `${vulns} ${vulns === 1 ? 'vulnerability' : 'vulnerabilities'}` : ``;
  }

  private exploitCountText(): string {
    return this.exploitCount > 0 ? `${this.exploitCount} exploit${this.exploitCount === 1 ? '' : 's'}` : ``;
  }

  public statusText(): string {
    if (!this.isDone()) {
      return `$(sync~spin) Dependency analysis in progress`;
    }
    if (this.hasWarning()) {
      const finalStatus = [this.vulnCountText(), this.exploitCountText()].filter(t => t.length > 0).join(`, `);
      return `$(warning) Found ${finalStatus}`;
    }
    return `$(shield)$(check)`;
  }
}

export { CANotification };
