export function newIdentifier(type = 'file', optional = false) {
    let idt = {
        type: type,
        optional: optional,
        match: 'exact',
        value: '',
        show: true,
    }

    if (type !== 'global') {
        idt['lineNumber'] = ''
    }

    return idt
}


export function addTable(type, optional, reader, cb) {
    reader.tables.push({
        min_number_of_col: 3,
        max_number_of_col: 5,
        has_start_identifier: false,
        start_identifier: newIdentifier('global'),
        allow_empty_col: false,
        has_col_header_row: false,
        has_row_header_col: false,
        allow_str_col: '',
        number_value_regex: '^(-?[\\d.,]+([eE]-?\\d+)?)$'
    })
    cb(reader)
}

export function addIdentifier(type, optional, profile, cb) {
    const identifier = newIdentifier(type, optional)

    profile.identifiers.content.push(identifier)
    cb(profile)
}

export function updateIdentifier(index, data, profile, cb) {
    if (index !== -1) {
        profile.identifiers.content[index] = Object.assign(profile.identifiers.content[index], data)
        cb(profile)
    }
}

export function removeIdentifier(index, profile, cb) {
    if (index !== -1) {
        profile.identifiers.content.splice(index, 1)
        cb(profile)
    }
}

export function addIdentifierOperation(index, profile, cb) {
    if (index !== -1) {
        const operation = {
            operator: '+'
        }
        if (profile.identifiers.content[index].operations === undefined) {
            profile.identifiers.content[index].operations = []
        }
        profile.identifiers.content[index].operations.push(operation)
        cb(profile)
    }
}

export function updateIdentifierOperation(index, opIndex, opKey, value, profile, cb) {
    if (index !== -1) {
        profile.identifiers.content[index].operations[opIndex][opKey] = value
        cb(profile)
    }
}

export function removeIdentifierOperation(index, opIndex, profile, cb) {
    if (index !== -1) {
        profile.identifiers.content[index].operations.splice(opIndex, 1)

        // remove operations if it is empty
        if (profile.identifiers.content[index].operations.length === 0) {
            delete profile.identifiers.content[index].operations
        }

        cb(profile)
    }
}
