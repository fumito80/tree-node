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

namespace F {
  export function flip<T, U, V>(f: { (a: T, b: U): V }) {
    return (b: U, a: T) => f(a, b);
  }
  export function flipCurried<T, U, V>(f: { (a: T, b: U): V }) {
    return (b: U) => (a: T) => f(a, b);
  }
  export function pipe<T, U>(fn: FnAny, ...fns: FnAny[]) {
    return (a: T) => fns.reduce((acc, fn2) => fn2(acc), fn(a)) as U;
  }
  export function compose<T, U>(...fns: FnAny[]) {
    return pipe<T, U>(fns.pop() as FnAny, ...fns.reverse());
  }
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
  getOrElse<U>(_: U): T | U;
  filter(f: FnAny): Just<T> | Nothing;
  chain<U>(f: FnMaybe<T, U>): U | Nothing;
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
  public getOrElse<U>(_: U) {
    return this.value as T | U;
  }
  public filter<U>(f: FnMaybe<T, U>) {
    if (f(this.value) == null) {
      return Maybe.nothing();
    }
    return this as Just<T>;
  }
  public chain<U>(f: FnMaybe<T, U>) {
    return f(this.value) as U;
  }
}

class Nothing extends Maybe implements IMaybe<never> {
  get value() {
    throw new TypeError(`Can't extract the value of a Nothing.`);
  }
  public map(_: any) {
    return this as Nothing;
  }
  public getOrElse = (other: any) => other;
  public filter = (_: any) => this as Nothing;
  public chain = (_: any) => this as Nothing;
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
