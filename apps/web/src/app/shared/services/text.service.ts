import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IText } from '../interface'

import 'rxjs/add/operator/do';


@Injectable()
export class TextService {

  // TextService store the result from text component into resultText so later on can be passed to enhancedTextResultPage
  public resultText: IText;

  constructor(private http: HttpClient) {
  }

  enhancedText(textArea: string): Observable<IText> {
    return this.http.post<IText>('/api/analyzeText', textArea)
      .do((res => console.log(res)));
  }


  public enhancedDoc(formdata: FormData): Observable<IText> {
    return this.http.post<IText>('/api/analyzeFile?type=DOC', formdata)
      .do((res => console.log(res)));
  }

  public enhancedPDF(formdata: FormData): Observable<IText> {
    return this.http.post<IText>('/api/analyzeFile?type=PDF', formdata)
      .do((res => console.log(res)));
  }

  /** Browser OCR posts the extracted text here. The response is the new analysis shape. */
  public analyzeExtractedText(text: string): Observable<any> {
    return this.http.post<any>('/api/analyze/text', { text: text })
      .do((res => console.log(res)));
  }

  /** Maps /api/analyze/text into the shape the existing results pages read. */
  public toLegacyAnalysis(result: any): IText {
    var counts = result.statistics.wordCount;
    var percents = result.statistics.wordPercentage;
    var breakdown = function (source, total) {
      return {
        stem: source.stem,
        awl: source.awl,
        hi: source.hi,
        med: source.med,
        low: source.low,
        noCategory: source.offList,
        k1: source.k1,
        k2: source.k2,
        k3: source.k3,
        total: total
      };
    };
    return {
      words: result.words.map(function (word) {
        var category = word.category || '';
        if (category.charAt(0) === 'k') category = category.toUpperCase();
        return { value: word.value || '', category: category, initialValue: word.initialValue };
      }),
      fleschReadingScore: result.fleschReadingScore,
      sentenceCount: result.sentenceCount,
      statistics: {
        wordCount: breakdown(counts, counts.total),
        wordPercentage: breakdown(percents, counts.total === 0 ? 0 : 1)
      }
    };
  }

}


