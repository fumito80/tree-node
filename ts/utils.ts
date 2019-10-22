'use strict';

function $<T extends HTMLElement>(selector: string, parent: Element | Document = document) {
  return parent.querySelector(selector) as T | null;
}

function $$(selector: string, parent: HTMLElement | Document = document) {
  return Array.from<Element>(parent.querySelectorAll(selector));
}

function insertBefore(refNode: Element | null = null) {
  return (parent: HTMLElement | null = null, newNode: Element | null = null) => {
    if (parent == null || newNode == null) {
      return null;
    }
    return parent.insertBefore(newNode, refNode);
  }
}

function getEventListener<T extends HTMLElement>(selector: string) {
  const target = $<T>(selector);
  if (target == null) {
    return () => null;
  }
  return target.addEventListener.bind(target);
}

function getEventListeners(selector: string) {
  const targets = $$(selector);
  if (targets.length === 0) {
    return [];
  }
  return targets.map((target) => target.addEventListener.bind(target));
}

function setElementText(el: HTMLElement | null, text: string) {
  if (el != null) {
    el.textContent = text;
  }
  return el;
}

const I = <T>(a: T) => a;

type FnAny = { (a: any): any };

namespace F {
  export function flip<T, U, V>(f: { (a: T, b: U): V }) {
    return (b: U, a: T) => f(a, b);
  }
  export function curry<T, U, V>(f: { (a: T, b: U): V }) {
    return (a: T) => (b: U) => f(a, b);
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
  filter(f: FnAny): Just<T> | Nothing;
  chain<U>(f: FnMaybe<T, U>): U | Nothing;
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
  public filter<U>(f: FnMaybe<T, U>) {
    if (f(this._value) == null) {
      return Maybe.nothing();
    }
    return this as Just<T>;
  }
  public chain<U>(f: FnMaybe<T, U>) {
    return f(this._value) as U;
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
  // public filter = (f) => Either.fromNullable(f(this.value) ? this.value : null);
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
  // public filter = (f) => this;
}
