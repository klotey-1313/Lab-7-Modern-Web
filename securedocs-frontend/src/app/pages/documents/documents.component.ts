import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './documents.component.html'
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];
  lastVisitedDocument: any | null = null;
  error = '';

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    try {
      const [documents, lastVisitedDocument] = await Promise.all([
        this.documentService.getAll(),
        this.documentService.getLastVisited()
      ]);

      this.documents = documents;
      this.lastVisitedDocument = lastVisitedDocument;
      this.error = '';
    } catch (err: any) {
      this.error = err?.error?.message || 'Failed to load documents';
    }
  }

  async loadDocuments(): Promise<void> {
    try {
      this.documents = await this.documentService.getAll();
      this.error = '';
    } catch (err: any) {
      this.error = err?.error?.message || 'Failed to load documents';
    }
  }

  editDocument(id: string): void {
    this.router.navigate(['/documents/edit', id]);
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.documentService.delete(id);
      await this.loadDocuments();
    } catch (err: any) {
      this.error = err?.error?.message || 'Failed to delete document';
    }
  }
}