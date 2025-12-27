import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

@Directive({
  selector: '[ruleAuthorized]'
})
export class RuleAuthorizedDirective implements OnInit {
  private roles: string[] = [];

  @Input() set ruleAuthorized(roles: string[]) {
    this.roles = roles;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    // TODO: Implement actual role checking logic with your auth service
    // For now, always show the content
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}

