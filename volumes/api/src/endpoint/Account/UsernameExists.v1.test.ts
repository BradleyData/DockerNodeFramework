import { Postgres } from "../../wrapper/Postgres"
import { QueryResult } from "pg"
import { TestHelper } from "../../TestHelper"
import { UsernameExists } from "./UsernameExists.v1"

jest.mock("../../wrapper/Postgres", () => {
    return {
        Postgres: jest.fn(),
    }
})

describe(UsernameExists.name, () => {
    // eslint-disable-next-line no-undefined
    test.each([[true], [false], [undefined]])(
        "post: username existence is %p",
        async (result?: boolean) => {
            const rowsAffected = result === true ? 1 : 0
            const errorMsg = "errorMsg"
            const username = "newUser85"
            Postgres.query = TestHelper.getPostgresQueryMock(
                rowsAffected,
                errorMsg,
                getQueryResults,
                result
            )

            const usernameExists = new UsernameExists("", 1, "get", username)
            await usernameExists.init()

            // eslint-disable-next-line no-undefined
            if (result === undefined) {
                expect(usernameExists.getRowsAffected()).toBe(0)
                const response = JSON.parse(usernameExists.getResponse())
                expect(response.error).toBe(errorMsg)
                expect(response.usernameExists).toBe(true)
            } else {
                expect(usernameExists.getRowsAffected()).toBe(rowsAffected)
                expect(Postgres.query).toBeCalledWith(
                    expect.stringContaining("SELECT"),
                    expect.arrayContaining([expect.any(String)]),
                    expect.any(Function)
                )
                expect(usernameExists.getResponse()).toBe(
                    JSON.stringify({ usernameExists: result })
                )
            }
        }
    )
})

function getQueryResults(result: boolean, values?: any): QueryResult {
    const username = result ? values[0] : ""
    const rows = username === "" ? [] : [{ username: username }]

    return {
        command: "",
        fields: [],
        oid: 0,
        rowCount: 0,
        rows: rows,
    }
}
