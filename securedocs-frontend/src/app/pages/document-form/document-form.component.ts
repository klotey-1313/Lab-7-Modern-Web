import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './document-form.component.html'
})
export class DocumentFormComponent implements OnInit {
  form = {
    title: '',
    description: ''
  };

  documentId: string | null = null;
  isEditMode = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.documentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.documentId;

    if (this.isEditMode && this.documentId) {
      try {
        const document: any = await this.documentService.getById(this.documentId);
        this.form.title = document.title;
        this.form.description = document.description;
      } catch (err: any) {
        this.error = err?.error?.message || 'Failed to load document';
      }
    }
  }

  async submit(): Promise<void> {
    this.error = '';

    try {
      if (this.isEditMode && this.documentId) {
        await this.documentService.update(this.documentId, this.form);
      } else {
        await this.documentService.create(this.form);
      }

      this.router.navigate(['/documents']);
    } catch (err: any) {
      this.error = err?.error?.message || 'Save failed';
    }
  }
}