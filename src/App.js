
import React from 'react';
import axios from "axios";
import { useTable, useSortBy } from "react-table"

const url = "/twitter_followers.csv"

class Table extends React.Component {
    state = {
        csv: [],
        columns: [],
    }

    getHeaders = async (url) => {
        return await axios.get(url).then(res => {
            const lines = res.data.split("\n")

            // Assumes headers are in the first row.
            return lines[0].split(",").map(header => {
                return ({
                    Header: header,
                    accessor: header,
                })
            })
        })
    }

    getData = async (url) => {
        return await axios.get(url).then(res => {

            let lines = res.data.split("\n")

            // Split lines.
            return lines.map(line => {
                // Assign
                let [account, followers, exclusive_followers_pct] = line.split(",")

                // Return dictionary
                if (account === "account" || account === "") {
                    return ''
                } else {

                    followers = parseFloat(followers)
                    exclusive_followers_pct = parseFloat(exclusive_followers_pct) * 100
                    return {
                        account,
                        followers,
                        exclusive_followers_pct,
                    }
                }
            })
        })
    }

    async componentDidMount() {
        let data = await this.getData(url)
        data = data.filter(d => d !== '')

        this.setState({
            csv: data,
        })
    }

    render() {
        if (this.state.csv) {
            return (
                <div className="App">
                    <RenderTable csv={this.state.csv} style={appStyle} />
                </div>
            )
        } else {
            return <div className="App">Waiting...</div>
        }
    }
}

// Render the main table.
const RenderTable = (props) => {
    let data = React.useMemo(() => props.csv, [props.csv]);
    let columns = React.useMemo(() => {
        return [
            {
                Header: "Account",
                accessor: "account",
                Cell: ({ cell: { value } }) => {
                    return <a href={"https://twitter.com/" + value}>
                        @{value}
                    </a>
                }
            },
            {
                Header: "Followers",
                accessor: "followers",
                Cell: ({ cell: { value } }) => {
                    return <Bar
                        values={getValues(value, props.csv, "followers")}
                        type={"float"}
                    />
                }
            },
            {
                Header: "Exclusive Followers",
                accessor: "exclusive_followers_pct",
                Cell: ({ cell: { value } }) => {
                    return <Bar
                        values={getValues(value, props.csv, "exclusive_followers_pct")}
                        type={"percent"}
                    />
                }
            },
        ]
    }, [props.csv])
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    }, useSortBy)

    // Render the UI for your table
    return (
        < table {...getTableProps()} >
            <thead style={headerStyle}>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())} >{column.render('Header')}
                                <span>
                                    {column.isSorted ?
                                        column.isSortedDesc ?
                                            <img alt="sort" text="sort" height="2%" src="/sort.png"></img> :
                                            <img alt="sort" text="sort" height="2%" src="/sort.png"></img> :
                                        ''
                                    }

                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table >
    )
}

// Helper functions.
const range = (data) => {
    return [Math.min(...data), Math.max(...data)]
}

const getValues = (value, items, key) => {
    let data = items
        .map(item => item[key])
        .filter(item => item !== undefined)
    const [min, max] = range(data)
    return { value: value, min: min, max: max }
}

function minMax(value, min, max) {
    return ((value + min) / (min + max))
}

// Barchart logic.
function Bar(props) {
    let value
    let currentBarStyle = Object.assign({}, barStyle)

    if (props.type === "float") {
        value = props.values.value.toLocaleString()
        currentBarStyle["width"] = (
            minMax(props.values.value, props.values.min, props.values.max) *
            currentBarStyle.maxWidth
        )
    }

    if (props.type === "percent") {
        // Format % number.
        value = parseFloat(props.values.value).toFixed(1) + "%"

        // Style
        currentBarStyle = Object.assign({}, percentStyle)
        currentBarStyle["width"] = percentCellStyle.width * (props.values.value / 100)
        currentBarStyle["margin"] = 0

        return <div style={{ display: "flex", width: "100%" }}>
            <div style={barLabel}>{value}</div>
            <div style={percentCellStyle}>
                <div style={currentBarStyle}>&nbsp;</div>
            </div>
        </div>
    }


    return <div style={{ display: "flex", width: "100%" }}>
        <div style={barLabel}>{value}</div>
        <div style={currentBarStyle}>&nbsp;</div>
    </div>
}


// Styles
const appStyle = {
    fontSize: "10pt",
    backgroundColor: "white",
    height: "100vh",
}

const tableStyle = {
    fontSize: "10pt",
    marginLeft: 10,
}

const titleStyle = {
    fontSize: "16pt",
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
}

const subTitleStyle = {
    fontSize: "10pt",
    fontWeight: "normal",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
}

const headerStyle = {
    color: "black",
    fontWeight: "normal",
    fontSize: "9pt",
    // Removes highlighted text.
    userSelect: "none",

}

const barStyle = {
    flex: "0,1,0",
    marginLeft: "5px",
    backgroundColor: "rgb(63, 193, 201)",
    color: "black",
    maxWidth: 150,
}

const percentCellStyle = {
    width: 150,
    margin: 0,
    backgroundColor: "#e1e1e1"
}

const percentStyle = {
    flex: "0,1,0",
    margin: 5,
    backgroundColor: "#fc5185",
    color: "black",
}

const barLabel = {
    flex: "0,1,0",
    textAlign: "right",
    marginRight: 5,
    color: "black",
    minWidth: 90,
}

export default function App() {
    return (
        <div className="App" style={appStyle}>
            <i name="sort.png"></i>
            <div style={tableStyle} >
                <div style={titleStyle}>Candidates whose followers are loyal only to them</div>
                <div style={subTitleStyle}>Share of each 2020 candidate's followers who don't follow any other candidates</div>
                <Table />
            </div>
        </div>
    );
}