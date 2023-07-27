from Constants import playerExceptionsMap

############################
#    Name Id generation    #
############################

# cleans player ids in order to map ktc value to sleeper data
def cleanPlayerIdString(playerId):
    playerNameId = playerId.lower().replace("jr.", "").replace("sr.", "").replace("iii", "").replace("ii", "").replace(" ", "")\
        .replace(".", "").replace("-", "").replace("'", "")
    if playerNameId in playerExceptionsMap:
        playerNameId = playerExceptionsMap[playerNameId]
    return playerNameId

# format pick number to be a string
# this is needed to align with name id format
def formatPickNumber(round):
    if round == '1':
        return '1st'
    elif round == '2':
        return '2nd'
    elif round == '3':
        return '3rd'
    else:
        return '4th'    
