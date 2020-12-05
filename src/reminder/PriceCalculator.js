
const calculatePrice = (person) =>
{

    var price = 199;
    
    if (person.certificate)
    {
        price += 50;
    }

    if (person.antiBodyTest)
    {
        price += (99 + 50);
    }

    return price;

}

const calculateTotalPrice = (persons) =>
{
    var totalPrice = 0;
    for (var i = 0 ; i < persons.length ; i++)
    {
        totalPrice += calculatePrice(persons[i]);
    }

    return totalPrice;
}

module.exports = {
    calculatePrice : calculatePrice,
    calculateTotalPrice : calculateTotalPrice
}