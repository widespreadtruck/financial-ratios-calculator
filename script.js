const app = {}    
app.baseUrl = 'https://financialmodelingprep.com/api/v3';

//returns connection to Company Profile. Takes Company Ticker
app.connectToCompanyProfile = (ticker) => {
    const connectToProfile = $.ajax({
        url: `${app.baseUrl}/company/profile/${ticker}`,
        dataType: 'json',
        method: 'GET',
    });
    return connectToProfile;
};

//returns connection to Income Stnt. Takes Company Ticker
app.connectToIncStnt = (ticker) => {
    const connectToIS = $.ajax({
        url: `${app.baseUrl}/financials/income-statement/${ticker}`,
        dataType: 'json',
        method: 'GET',
    });
    return connectToIS;
};

//returns connection to Balance Sheet. Takes Company Ticker
app.connectToBalanceSheet = (ticker) => {
    const connectToBS = $.ajax({
        url: `${app.baseUrl}/financials/balance-sheet-statement/${ticker}`,
        dataType: 'json',
        method: 'GET'
    });
    return connectToBS;
};

//calculate Net Profit Margin = Net Profit / Net Sales
app.getNetProfitMargin = (ticker) => {
    const iSObject = app.connectToIncStnt(ticker);
    iSObject.then(function(data){
        const netIncomeOrProfit = data.financials[0]['Net Income'];
        const netSalesOrRevenue = data.financials[0]['Revenue'];
        const netProfitMargin = (netIncomeOrProfit / netSalesOrRevenue).toFixed(2);
        console.log(`Net Profit Margin = ${netProfitMargin}`);
        
        //add text w/ ROE
        const htmlToAppend = `
        <tr class="netProfitMargin"><td>Net Profit Margin</td><td>Net Profit / Net Sales</td><td>${netProfitMargin}</td></tr>
        `;
        $(htmlToAppend).appendTo('.text-container');    
    })
};

//calculate Return on Equity (ROE) = Net Income/Shareholder's Equity
app.getROE = (ticker) => {
    const iSObject = app.connectToIncStnt(ticker);
    iSObject.then(function(data){
        const netIncome = data.financials[0]['Net Income'];

        //call value from another ajax call
        const balanceSheetObject = app.connectToBalanceSheet(ticker);
        balanceSheetObject.then(function(data){
            const totalShareholdersEquity = data.financials[0]['Total shareholders equity'];
            const roe = (netIncome / totalShareholdersEquity).toFixed(2);
            console.log(`Return on Equity (ROE) = ${roe}`);
            
            //add text w/ ROE
            const htmlToAppend = `
                <tr class="returnOnEquity"><td>Return on Equity (ROE)</td><td>Net Income/Shareholder's Equity</td><td>${roe}</td></tr>
            `;
            $(htmlToAppend).appendTo('.text-container');
        })
    });
};

//calculate Quick Ratio = (Current Assets – Inventories)/ Current Liabilities
app.getQuickRatio = (ticker) => {
    const balanceSheetObject = app.connectToBalanceSheet(ticker);
    balanceSheetObject.then((data) => {
        const inventories = data.financials[0]['Inventories'];
        const currentAssets = data.financials[0]['Total current assets'];
        const currentLiabilities = data.financials[0]['Total current liabilities'];
        const quickRatio = ((currentAssets - inventories) / currentLiabilities).toFixed(2);
        console.log(`Quick Ratio = ${quickRatio}`);

        //add text w/ ROE
        const htmlToAppend = `
        <tr class="quickRatio"><td>Quick Ratio</td><td>(Current Assets – Inventories)/ Current Liabilities</td><td>${quickRatio}</td></tr>
        `;
        $(htmlToAppend).appendTo('.text-container');
    })
}

//calculate Current Ratio = Current Assets / Current Liabilities
app.getCurrentRatio = (ticker) => {
    const balanceSheetObject = app.connectToBalanceSheet(ticker);
    balanceSheetObject.then((data) => {
        const currentAssets = data.financials[0]['Total current assets'];
        const currentLiabilities = data.financials[0]['Total current liabilities'];
        const currentRatio = (currentAssets / currentLiabilities).toFixed(2);
        console.log(`Current Ratio = ${currentRatio}`);

        //add text w/ ROE
        const htmlToAppend = `
        <tr class="currentRatio"><td>Current Ratio</td><td>Current Assets / Current Liabilities</td><td>${currentRatio}</td></tr>
        `;
        $(htmlToAppend).appendTo('.text-container');
    });
};

//calculate Debt-to-Equity
app.getDebtToEquity = (ticker) => {
    const balanceSheetObject = app.connectToBalanceSheet(ticker);
    balanceSheetObject.then((data) => {
        const totalLiabilities = data.financials[0]['Total liabilities'];
        const totalShareholdersEquity = data.financials[0]['Total shareholders equity'];
        const debtToEquity = (totalLiabilities / totalShareholdersEquity).toFixed(2);
        console.log(`Debt-to-Equity Ratio = ${debtToEquity}`);

        //add text w/ ROE
        const htmlToAppend = `
        <tr class="debtToEquity"><td>Debt-to-Equity Ratio</td><td>Total Liabilities / Shareholders Equity</td><td>${debtToEquity}</td></tr>
        `;
        $(htmlToAppend).appendTo('.text-container');
    });
};    

//get and pring Full Company Name.
app.printFullCompanyName = function(enteredTicker) {
    const companyNameObject = app.connectToCompanyProfile(enteredTicker);
    //using .done NOT .then
    companyNameObject.done(function(data){
        console.log(data);
        if (data.symbol === enteredTicker) {
            const fullNameOfCompany = data.profile.companyName;
            $('.companyName').append(`
                <div>Calculating Top 5 Financial Ratios for: <span>${fullNameOfCompany}</span></div>
            `);    
            console.log(fullNameOfCompany);
            app.executeAllCalculations(enteredTicker);
        } else {
            swal('Sorry! The ticker you entered does not exist.');
            //empty the input field
            $(`input[type="text"]`).val('');
        };
    });
};

//set a table header below Company Name.
app.addTableHeader = function(){
    $('.text-container').prepend(`
        <tr>
            <th>Ratio</th>
            <th>Formula</th>
            <th>Result</th>
        </tr>
    `);
};

//execute calculations
app.executeAllCalculations = function(enteredTicker){
    // // add Table Header
    app.addTableHeader();
    // // execute calculations
    app.getDebtToEquity(enteredTicker);
    app.getCurrentRatio(enteredTicker);
    app.getQuickRatio(enteredTicker);
    app.getROE(enteredTicker);
    app.getNetProfitMargin(enteredTicker);
};

//clear the page on Reset button
app.emptyResultsAndPage = function(){
    $('.reset').on('click', function() {
        $('.companyName, .text-container').empty();
    });
};

//get submit form input e.g. AAPL
app.getEnteredTicker = () => {    
    $('form').on('submit', (event) => {
        event.preventDefault();
        const enteredTicker = $(`input[type="text"]`).val().toUpperCase();
        //console.log the Ticker entered
        console.log(`Entered ticker: ${enteredTicker}`);
        //clear the page when Generate is clicked
        $('.companyName, .text-container').empty();
        //get and pring Full Company Name
        app.printFullCompanyName(enteredTicker);
    });
};

app.init = () => {
    app.getEnteredTicker();    
    //clear the page on Reset button
    app.emptyResultsAndPage();
};

$(function(){
    app.init();
});


