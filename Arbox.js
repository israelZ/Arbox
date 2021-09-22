var fs = require("fs");
var csv = require("fast-csv");
const readXlsxFile = require('read-excel-file/node')
var _ = require('lodash');
const prompt = require('prompt-sync')({ sigint: true })




function getNameColumns() {
    const first_name = prompt(`What's name column of 'first name' in your table?`)
    const last_name = prompt(`What's name column of 'last name' in your table?`)
    const phone = prompt(`What's name column of 'phone' in your table?`)
    const email = prompt(`What's name column of 'email' in your table?`)
    const joined_at = prompt(`What's name column of 'joined at' in your table?`)
    // const first_name = 'first_name'
    // const last_name = 'last_name'
    // const phone = 'phone'
    // const email = 'email'
    // const joined_at = 'membershp_start_date'

    return [{ first_name }, { last_name }, { email }, { joined_at }, { phone },]
}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/')
}

async function getTable(path, columns) {


    const tableBody = await readXlsxFile(path)

    const nameColumns = tableBody.shift()


    for (const [index, column] of columns.entries()) {
        const [key, value] = _.get(Object.entries(column), '0', null)

        let indexColumn = nameColumns.indexOf(value)
        if (indexColumn > -1) {
            columns[index][key] = indexColumn
        }
        else {
            console.log(`column ${value} not found`)
        }
    }
    return tableBody
}

function createTable(table, columns, clubId) {

    const csvStream = csv.format({ headers: true });
    const [fn, ln, email, joined_at, phone] = columns
    let emailMap = new Map()


    const [keyFirstName, indexFirstName] = _.get(Object.entries(fn), '0', null)
    const [keyLastName, indexLastName] = _.get(Object.entries(ln), '0', null)
    const [keyEmail, indexEmail] = _.get(Object.entries(email), '0', null)
    const [keyJoined, indexJoined] = _.get(Object.entries(joined_at), '0', null)
    const [keyPhone, indexPhone] = _.get(Object.entries(phone), '0', null)

    for (const row of table) {
        const emailAddress = row[indexEmail]
        csvStream.write({
            [keyFirstName]: row[indexFirstName],
            [keyLastName]: row[indexLastName],
            [keyPhone]: row[indexPhone],
            [keyEmail]: row[indexEmail],
            [keyJoined]: convertDate(row[indexJoined]),
            'club_id': clubId
        });
        if (emailMap.has(emailAddress)) {

            return console.log(`email ${emailAddress} is not unique`)
        }
        else {
            emailMap.set(emailAddress)
        }
    }
    var ws = fs.createWriteStream('convertTabel.csv')
    csvStream.pipe(ws);
    console.log('Done')
}


async function parsExcel() {

    console.log(` 
    .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
    | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
    | |      __      | || |  _______     | || |   ______     | || |     ____     | || |  ____  ____  | |
    | |     /  \\     | || | |_   __ \\    | || |  |_   _ \\    | || |   .'    '.   | || | |_  _||_  _| | |
    | |    / /\\ \\    | || |   | |__) |   | || |    | |_) |   | || |  /  .--.  \\  | || |   \\ \\  / /   | |
    | |   / ____ \\   | || |   |  __ /    | || |    |  __'.   | || |  | |    | |  | || |    > '' <    | |
    | | _/ /    \\ \\_ | || |  _| |  \\ \\_  | || |   _| |__) |  | || |  \\  '--'  /  | || |  _/ /''\\ \\_  | |
    | ||____|  |____|| || | |____| |___| | || |  |_______/   | || |   '.____.'   | || | |____||____| | |
    | |              | || |              | || |              | || |              | || |              | |
    | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
    '----------------'  '----------------'  '----------------'  '----------------'  '----------------' `)

    console.log('Welcome to conversion interface')
    const club_id = prompt(`What's  id of your club?`)
    const pathFile = prompt(`What's path of your file/excel?`)
    // const club_id=  `2400`
    // const pathFile=  `jimalaya.xlsx`

    const nameColumns = getNameColumns()

    try {
        const tableBody = await getTable(pathFile, nameColumns, club_id)
        createTable(tableBody, nameColumns, club_id)

    } catch (error) {
        console.log('path file is error')
    }
}
parsExcel()


// const club_id=  `2400`
// const pathFile=  `jimalaya.xlsx
// const first_name = 'first_name'
// const last_name = 'last_name'
// const phone = 'phone'
// const email = 'email'
// const joined_at = 'membershp_start_date'