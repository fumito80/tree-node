'use strict';

function $<T>(parent: HTMLElement | Document = document) {
  return (selector: string) => {
    return parent.querySelector(selector) as T | null;
  }
}

function $$(parent: HTMLElement | Document = document) {
  return (selector: string) => {
    return [...parent.querySelectorAll(selector) as NodeListOf<HTMLElement>];
  }
}

type FnAny = { (a: any): any };

function pipe<T1, T2>(fn: FnAny, ...fns: FnAny[]) {
  return (a: T1) => fns.reduce((acc, fn2) => fn2(acc), fn(a)) as T2;
}

function compose<T1, T2>(...fns: FnAny[]) {
  return pipe<T1, T2>(fns.pop() as FnAny, ...fns.reverse());
}

class Maybe {
  public static just<T>(a: T) {
    return new Just<T>(a);
  }
  public static nothing() {
    return new Nothing();
  }
  public static fromNullable<T>(a?: T | null) {
    return (a != null ? Maybe.just<T>(a) : Maybe.nothing()) as Just<T>;
  }
  public static of<T>(a: T) {
    return Maybe.just<T>(a);
  }
  get isNothing() {
    return false;
  }
  get isJust() {
    return false;
  }
}

interface FnMaybe<T, U> { (a: T): U | null };

interface IMaybe<T> {
  value: T | void;
  map<U>(f: FnMaybe<T, U>): Just<U> | Nothing;
  getOrElse(_: any): any;
  filter(f: FnAny): Just<T> | Nothing;
  chain<U>(f: FnMaybe<T, U>): Just<U> | Nothing;
}

class Just<T> extends Maybe implements IMaybe<T> {
  constructor(private _value: T) {
    super();
  }
  get value() {
    return this._value;
  }
  public map<U>(f: FnMaybe<T, U>) {
    return Maybe.fromNullable<U>(f(this.value));
  }
  public getOrElse = (_: any) => this.value;
  public filter(f: FnAny) {
    if (f(this.value) == null) {
      return Maybe.nothing();
    }
    return this as Just<T>;
  }
  public chain<U>(f: FnAny) {
    return f(this.value) as U;
  }
}

class Nothing extends Maybe implements IMaybe<never> {
  get value() {
    throw new TypeError(`Can't extract the value of a Nothing.`);
  }
  public map<T, U>(_: FnMaybe<T, U>) {
    return this;
  }
  public getOrElse = (other: any) => other;
  public filter = (_: any) => this;
  public chain = (_: any) => this;
}

/**
 * Either monad
 */
// class Either {
//   public static left = (a) => new Left(a);
//   public static right = (a) => new Right(a);
//   public static fromNullable = (val) => val != null ? Either.right(val) : Either.left(val);
//   public static of = (a) => Either.right(a);
//   constructor(protected _value) {}
//   get value() {
//     return this._value;
//   }
// }

// interface IEither {
//   value;
//   map(f);
//   getOrElse(_);
//   orElse(f);
//   chain(f);
//   getOrElseThrow(a);
//   filter(f);
// }

// class Right extends Either implements IEither {
//   get value() {
//     return this.value;
//   }
//   public map = (f) => Either.of(f(this.value));
//   public getOrElse = (_) => this.value;
//   public orElse = (_) => this;
//   public chain = (f) => f(this.value);
//   public getOrElseThrow = (a) => this.value;
//   public filter = (f) => Either.fromNullable(f(this.value) ? this.value : null);
// }

// class Left extends Either implements IEither {
//   get value() {
//     throw new TypeError(`Can't extract the value of a Left(a).`);
//   }
//   public map = (_) => this;
//   public getOrElse = (other) => other;
//   public orElse = (f) => f(this.value);
//   public chain = (f) => this;
//   public getOrElseThrow = (a) => {throw new Error(a); };
//   public filter = (f) => this;
// }
