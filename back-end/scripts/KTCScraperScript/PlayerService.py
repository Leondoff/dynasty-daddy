
############################
#    Name Id generation    #
############################


# cleans player ids in order to map ktc value to sleeper data
def cleanPlayerIdString(playerId):
    return playerId.lower().replace("jr.", "").replace("sr.", "").replace("iii", "").replace("ii", "").replace(" ", "")\
        .replace(".", "").replace("-", "").replace("'", "")
