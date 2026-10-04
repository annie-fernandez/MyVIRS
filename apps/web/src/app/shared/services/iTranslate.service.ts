import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { iTranslation } from 'app/shared/interface/iTranslation';
import 'rxjs/add/operator/do';
import { IText } from '../interface';



@Injectable()
export class iTranslateService
{
  constructor(private http: HttpClient) {
  }
  getTranslation(text: string, language: string)
  {
    return this.http.post('/api/translate', { text: text, target: language });
  }
  retrieveTextFromResults(rec : any) : string
  {
    return rec && typeof rec.translatedText === 'string' ? rec.translatedText : '';
  }
  transformTextToString(text : IText) : string
  {
    if(!text || !text.words || text.words.length == 0) return "";

    var words = [];
    var n = text.words.length;
    var i = 0;
    var tmp;
    for(; i < n; ++i)
    {
      tmp = text.words[i].initialValue;
      words.push(!tmp || tmp === "" ? "\n" : tmp + " ");
    }//for i
    tmp = null;
    i = null;
    n = null;
    var result = words.length > 0 ? words.join("") : "";

    words = null;
    
    return result;
  }
}
