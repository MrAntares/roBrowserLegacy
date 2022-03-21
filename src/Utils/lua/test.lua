--test = require("../src/Utils/lua/test.lua")

print('this is test.lua')

local function some_function(some_value)
    return 'text ' .. some_value
end

return {
    test_function = some_function
}
