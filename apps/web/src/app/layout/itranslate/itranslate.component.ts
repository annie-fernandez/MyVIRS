import { Component, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { iTranslateService } from '../../shared/services';
import { translationLanguages } from '../../shared/translation-languages';

@Component({
  selector: 'app-itranslate',
  templateUrl: './itranslate.component.html',
  styleUrls: ['./itranslate.component.scss'],
})
export class ItranslateComponent implements OnInit {
  @Input() textArea: string = '';
  @Input() target: string;
  t2: string = '';
  optionsSelect = translationLanguages;
  isTranslating: boolean = false;
  maxCharacters: number = 5000;

  constructor(private _itranslate: iTranslateService) { }

  ngOnInit() { }

  get charsLeft(): number {
    return this.maxCharacters - (this.textArea || '').length;
  }

  translate() {
    if (this.isTranslating) return;
    var text = (this.textArea || '').trim();
    if (!text || !this.target) {
      this.t2 = 'Enter some text and select a target language.';
      return;
    }
    if (text.length > this.maxCharacters) {
      this.t2 = 'Please enter no more than 5,000 characters.';
      return;
    }

    this.isTranslating = true;
    this.t2 = '';
    this._itranslate.getTranslation(text, this.target).subscribe(
      (rec: any) => {
        this.t2 = this._itranslate.retrieveTextFromResults(rec);
        this.isTranslating = false;
      },
      (err: HttpErrorResponse) => {
        var error = err.error && err.error.error;
        this.t2 = error && error.message ? error.message : 'Translation is unavailable. Please try again later.';
        this.isTranslating = false;
      }
    );
  }

  eraseText() {
    this.textArea = '';
    this.t2 = '';
  }
}
