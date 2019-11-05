'use strict';

function $<T extends HTMLElement>(selector: string, parent: HTMLElement | Document = document) {
  return parent.querySelector(selector) as T | null;
}

function $$(selector: string, parent: HTMLElement | Document = document) {
  return Array.from<HTMLElement>(parent.querySelectorAll(selector));
}

function insertBefore(parent: HTMLElement | null = null, newNode: HTMLElement | null = null, refNode: HTMLElement | null = null) {
  if (parent == null || newNode == null) {
    return null;
  }
  return parent.insertBefore(newNode, refNode);
}

function append(newNode: HTMLElement | null) {
  return (refNode: HTMLElement | null = null) => (parent: HTMLElement | null) => {
    insertBefore(parent, newNode, refNode);
    return parent;
  }
}

function getEventListener<T extends HTMLElement>(targetOrSelector: string | HTMLElement) {
  if (typeof targetOrSelector === 'string') {
    const target = $<T>(targetOrSelector);
    if (target == null) {
      return () => null;
    }
    return target.addEventListener.bind(target);
  }
  return targetOrSelector.addEventListener.bind(targetOrSelector);
}

function getEventListeners(selector: string) {
  return $$(selector).map((target) => target.addEventListener.bind(target));
}

function setElementText(el: HTMLElement | null, text: string) {
  if (el != null) {
    el.textContent = text;
  }
  return el;
}

interface FnSingle<T, U> { (a: T): U };

const I = <T>(a: T) => a; // identity
const W = <T, U>(f: { (a: T): { (a: T): U }}) => (x: T) => f(x)(x); // duplication
const B = <T, U, V>(f: FnSingle<T, V>) => (g: FnSingle<U, T>) => (x: U) => f(g(x)); // compose
const C = <T, U, V>(f: FnSingle<T, FnSingle<U, V>>) => (y: U) => (x: T) => f(x)(y); // flip

type FnAny = { (a: any): any };

namespace F {
  export function eq<T>(a: T) {
    return (b: T) => a === b;
  }
  export function invoke<T>(methodNameOrArray: string | string[], ...args: any[]) {
    if (typeof methodNameOrArray === 'string') {
      return (obj: any) => {
        if (obj == null || obj[methodNameOrArray] == null) {
          return null;
        }
        return obj[methodNameOrArray](...args) as T;
      }
    }
    const [methodName1, ...methodNames] = methodNameOrArray;
    return (obj: any) => {
      const methodOrObj = methodNames.reduce((acc, methodName) => {
        const obj2 = acc[methodName];
        return obj2 == null ? () => null : typeof obj2 === 'function' ? obj2.bind(acc) : obj2;
      }, obj[methodName1]);
      if (typeof methodOrObj === 'function') {
        return methodOrObj(...args) as T;
      }
      return methodOrObj as T;
    }
  }
  export function flip<T, U, V>(f: { (a: T, b: U): V }) {
    return (b: U, a: T) => f(a, b);
  }
  export function curry<T, U, V>(f: { (a: T, b: U): V }) {
    return (a: T) => (b: U) => f(a, b);
  }
  export function curry3<T, U, V, W>(f: { (a: T, b: U, c: V): W }) {
    return (a: T) => (b: U) => (c: V) => f(a, b, c);
  }
  // export function curries<T>(f: { (...args: any): T }) {
  //   return   (a: T) => (b: U) => f(a, b);
  // }
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
  public static just<T>(value: T) {
    return new Just<T>(value);
  }
  public static nothing() {
    return new Nothing();
  }
  public static fromNullable<T>(value: T | null | undefined): Just<T> {
    if (value == null) {
      return Maybe.nothing() as Just<T>;
    }
    return Maybe.just<T>(value);
  }
  public static of<T>(value: T) {
    return Maybe.just<T>(value);
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
  filter<U>(f: FnMaybe<T, U | boolean>): Just<T> | Nothing;
  chain<U>(f: FnMaybe<T, U>): U | Nothing;
  tap<U>(f: FnMaybe<T, U>): Just<T> | Nothing;
}

class Just<T> extends Maybe implements IMaybe<T> {
  constructor(private _value: T) {
    super();
  }
  get value() {
    return this._value as T | void;
  }
  public map<U>(f: FnMaybe<T, U>) {
    return Maybe.fromNullable<U>(f(this._value));
  }
  public getOrElse<U>(_: U) {
    return this._value as T | U;
  }
  public filter<U>(f: FnMaybe<T, U | boolean>): Just<T> {
    const ret = f(this._value);
    if (ret == null || ret === false) {
      return Maybe.nothing() as Just<T>;
    }
    return this as Just<T>;
  }
  public chain<U>(f: FnMaybe<T, U>) {
    return f(this._value) as U;
  }
  public tap<U>(f: FnMaybe<T, U>) {
    f(this._value);
    return this as Just<T>;
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
  public tap = (_: any) => this as Nothing;
}

/**
 * Either monad
 */
class Either<T> {
  public static left<U>(value: U) {
    return new Left(value);
  }
  public static right<U>(value: U) {
    return new Right(value);
  }
  public static fromNullable<U>(value: U | null | undefined) {
    if (value == null) {
      return Either.left(value);
    }
    return Either.right(value);
  }
  public static of<U>(value: U) {
    return Either.right(value);
  }
  constructor(protected _value: T) {}
  get value() {
    return this._value as T | void;
  }
  public getOr = () => this.value;
}

interface IEither<T> {
  value: T | void;
  map<U>(f: FnMaybe<T, U>): Right<U | null> | Left<T>;
  // getOrElse(_);
  // orElse(f);
  // chain(f);
  // getOrElseThrow(a);
  // filter(f);
}

class Right<T> extends Either<T> implements IEither<T> {
  get value() {
    return this._value;
  }
  public map<U>(f: FnMaybe<T, U>) {
    return Either.of(f(this._value));
  }
  public getOrElse = () => this.value;
  public orElse = () => this;
  // public chain = (f) => f(this.value);
  // public getOrElseThrow = (a) => this.value;
  public filter<U>(f: FnMaybe<T, U | boolean>) { //Either.fromNullable(f(this._value) ? this._value : null);
    const ret = f(this._value);
    if (ret == null || ret === false) {
      return Either.left(this.value);
    }
    return Either.right(this.value);
  }
  public toRight = () => this;
}

class Left<T> extends Either<T> implements IEither<T> {
  get value() {
    throw new TypeError(`Can't extract the value of a Left(a).`);
  }
  public map = () => this;
  public getOrElse<U>(other: U) {
    return other;
  }
  public orElse<U>(f: FnMaybe<T, U>) {
    return f(this._value);
  }
  // public chain = (f) => this;
  // public getOrElseThrow = (a) => {throw new Error(a); };
  public filter = (_: any) => this as Left<T>;
  public toRight<U>(f: FnMaybe<T, U>) {
    return Either.of(f(this._value));
  } 
}
