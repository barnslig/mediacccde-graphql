import {
  isPlainObject,
  camelizeObj,
  orderObjArray,
  makeConnectionResponse,
  //  makeConnectionResponseFromArray,
  //  makeConnectionResponseFromResponse
} from "./helpers";

test("isPlainObject", () => {
  expect(isPlainObject({})).toBe(true);
  expect(isPlainObject([])).toBe(false);
  expect(isPlainObject("blabla")).toBe(false);
  expect(isPlainObject(1234)).toBe(false);
});

describe("camelizeObj", () => {
  test("is camelizing first-level keys", () => {
    expect(camelizeObj({ foo_bar: "baz_bla" })).toEqual({ fooBar: "baz_bla" });
  });

  test("is camelizing second-level keys", () => {
    expect(
      camelizeObj({
        foo_bar: {
          baz_bla: "test_test",
        },
      })
    ).toEqual({
      fooBar: {
        bazBla: "test_test",
      },
    });
  });

  test("is not camelizing keys in objects", () => {
    expect(
      camelizeObj({
        foo_bar: [{ baz_bla: "test_test" }],
      })
    ).toEqual({
      fooBar: [{ baz_bla: "test_test" }],
    });
  });
});

describe("orderObjArray", () => {
  const data = [{ a: 7 }, { a: 2 }, { a: 5 }, { a: 3 }, { a: 9 }];

  test("is sorting ascending", () => {
    const expected = [{ a: 2 }, { a: 3 }, { a: 5 }, { a: 7 }, { a: 9 }];
    const orderBy = { field: "a", direction: "ASC" };
    expect(data.sort(orderObjArray(orderBy))).toEqual(expected);
  });

  test("dis sorting escending", () => {
    const expected = [{ a: 9 }, { a: 7 }, { a: 5 }, { a: 3 }, { a: 2 }];
    const orderBy = { field: "a", direction: "DESC" };
    expect(data.sort(orderObjArray(orderBy))).toEqual(expected);
  });
});

describe("makeConnectionResponse", () => {
  test("has no next and prev page when all nodes are included", () => {
    expect(makeConnectionResponse([], 20, 0, 20)).toEqual({
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 20,
    });
  });

  test("has a next page when offset and limit are less than totalCount", () => {
    expect(makeConnectionResponse([], 20, 0, 10)).toEqual({
      nodes: [],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
      },
      totalCount: 20,
    });
  });

  test("has a previous page when offset and totalCount are larger than zero", () => {
    expect(makeConnectionResponse([], 20, 10, 20)).toEqual({
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
      },
      totalCount: 20,
    });
  });

  test("has a next and previous page when offset is larger than zero and offset plus limit are less than totalCount", () => {
    expect(makeConnectionResponse([], 20, 10, 5)).toEqual({
      nodes: [],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
      },
      totalCount: 20,
    });
  });
});
