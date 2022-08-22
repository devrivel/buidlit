pragma solidity ^0.8.10;
pragma abicoder v2;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract SubscriptionHandler is AccessControl {
    /********* VARIABLES ********/
    ISwapRouter public immutable swapRouter;

    bytes32 public constant SUBSCRIPTION_PROCESSOR =
        keccak256("SUBSCRIPTION_PROCESSOR");

    uint256 basisPoints = 1000;

    uint256 padding;

    uint8 rivelFee;

    struct Product {
        address merchant;
        address tokenOut;
        uint256 amountRecurring;
        uint256 periodInterval;
        bytes32 productId;
        uint256 trialPeriod;
    }

    struct Subscription {
        address payeeAddress;
        address tokenAddressIn;
        uint256 nextPaymentTime;
        bytes32 productId;
    }

    /********* MAPPINGS ********/

    /* subscription mapping for individual subscriptions */
    mapping(bytes32 => Subscription) public subscriptions;
    /* subscription mapping for merchant subscription */
    mapping(bytes32 => Product) public merchantProducts;
    /* subscription mapping for subscriptions under a user's address */
    mapping(address => bytes32[]) public subscribers_subscriptions;
    /* subscription mapping for mappings under a merchant address */
    mapping(address => bytes32[]) public merchants_products;
    /* token address mappings to data feed aggregator addresses */
    mapping(address => address) public tokenToOracle;
    /* token address to decimals */
    mapping(address => uint8) public tokenToDecimals;

    /********* EVENTS ********/

    event NewProduct(
        address _merchant,
        address _tokenOut,
        uint256 _amountRecurring,
        uint256 _periodInterval,
        bytes32 _productId,
        uint256 _trialPeriod
    );

    event NewSubscription(
        address _payeeAddress,
        address _tokenAddressIn,
        uint256 _nextPaymentTime,
        bytes32 _productId,
        bytes32 _subscriptionId
    );

    /******* Constructor ********/

    constructor(
        address _adminAddress,
        address[] memory _subscriptionRoles,
        ISwapRouter _swapRouter
    ) AccessControl() {
        swapRouter = _swapRouter;

        _setupRole(DEFAULT_ADMIN_ROLE, _adminAddress);

        for (uint256 i = 0; i < _subscriptionRoles.length; i++) {
            _setupRole(SUBSCRIPTION_PROCESSOR, _subscriptionRoles[uint256(i)]);
        }
    }

    /******** ROLES *********/

    /// @dev Restricted to admin.
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to Admin(s).");
        _;
    }

    /// @dev Return `true` if the `account` is an admin.
    function isAdmin(address account) public view virtual returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Add an address to admin
    function addAdmin(address account) public virtual onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Remove oneself as an admin.
    function removeAdmin(address account) public virtual onlyAdmin {
        revokeRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Restricted to subscription processors.
    modifier onlyProcessor() {
        require(
            isProcessor(msg.sender),
            "Restricted to Subscription Processors."
        );
        _;
    }

    /// @dev Return `true` if the `account` is already granted role.
    function isProcessor(address account) public view virtual returns (bool) {
        return hasRole(SUBSCRIPTION_PROCESSOR, account);
    }

    /// @dev Add processor.
    function addProcessor(address account) public virtual onlyAdmin {
        grantRole(SUBSCRIPTION_PROCESSOR, account);
    }

    /// @dev Remove precessor.
    function removeProcessor(address account) public virtual onlyAdmin {
        renounceRole(SUBSCRIPTION_PROCESSOR, account);
    }

    /*****  UTILS ******/

    /// @dev calculate transaction padding for multihop swaps
    /// @param _price price to be padded

    function calculatePadding(uint256 _price) internal view returns (uint256) {
        return _price + ((_price * padding) / basisPoints);
    }

    /// @dev calculate price after deducting rivel fee
    /// @param _price pre tax price

    function calculateRivelPrice(uint256 _price)
        internal
        view
        returns (uint256 rivelPrice)
    {
        return _price - ((_price * rivelFee) / basisPoints);
    }

    /// @dev price feed exchange rate calculation

    function getExchangeAmount(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountOut
    ) internal view returns (uint256) {
        AggregatorV3Interface priceFeedIn = AggregatorV3Interface(
            tokenToOracle[_tokenIn]
        );
        AggregatorV3Interface priceFeedOut = AggregatorV3Interface(
            tokenToOracle[_tokenOut]
        );

        (
            ,
            /*uint80 roundID*/
            int256 priceIn, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeedIn.latestRoundData();

        (
            ,
            /*uint80 roundID*/
            int256 priceOut, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeedOut.latestRoundData();
        int256 exchangeRate;
        uint256 amountOut = _amountOut *
            (10**(18 - uint256(tokenToDecimals[_tokenOut])));
        if (priceIn > priceOut) {
            exchangeRate = (priceIn * 100) / (priceOut * 100);
            amountOut = (amountOut / uint256(exchangeRate));
        } else {
            exchangeRate = (priceOut * 100) / (priceIn);
            amountOut = ((amountOut * uint256(exchangeRate)) / 100);
        }

        amountOut = amountOut / (10**(18 - uint256(tokenToDecimals[_tokenIn])));

        return amountOut;
    }

    /********* FUNCTIONS ********/

    /// @dev Sets transaction padding to multiswap
    /// @param _padding padding for transaction
    /* padding % must be input as out of 1000, ex 10% = 100/1000 */

    function setPadding(uint256 _padding) public onlyAdmin {
        padding = _padding;
    }

    /// @dev Sets fee for rivel tax
    /// @param _rivelFee fee for transaction
    /* fee must be input as out of 1000, ex 10% = 100/1000 */

    function setRivelFee(uint8 _rivelFee) public onlyAdmin {
        rivelFee = _rivelFee;
    }

    /// @dev Add token-oracle mapping pairs
    function addTokenOraclePair(
        address _tokenAddress,
        address _oracleAddress,
        uint8 _decimals
    ) public onlyAdmin {
        tokenToOracle[_tokenAddress] = _oracleAddress;
        tokenToDecimals[_tokenAddress] = _decimals;
    }

    /// @dev View token-oracle mapping pairs

    function viewOraclePair(address _tokenAddressIn)
        public
        view
        returns (address, uint8)
    {
        return (
            tokenToOracle[_tokenAddressIn],
            tokenToDecimals[_tokenAddressIn]
        );
    }

    /// @dev Remove token-oracle mapping pairs

    function removeTokenOraclePair(address _tokenAddress) public onlyAdmin {
        tokenToOracle[_tokenAddress] = address(0);
        tokenToDecimals[_tokenAddress] = 0;
    }

    /// @notice swapExactOutputMultihop swaps a minimum possible amount of _tokenIn for a fixed amount of _amountOut through an intermediary pool.
    /// @dev The calling address must approve this contract to spend its _tokenIn for this function to succeed. As the amount of input of _tokenIn is variable,
    /// the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @param _amountOut The desired amount of the output token.
    /// @param _amountInMaximum The maximum amount of _tokenIn willing to spend to achieve the _amountOut.
    /// @return amountIn The amountIn of DAI actually spent to receive the desired amountOut.

    function swapExactOutputMultihop(
        uint256 _amountOut,
        uint256 _amountInMaximum,
        bytes memory _swapPath,
        address _tokenIn,
        address _payeeAddress,
        address _merchant
    ) internal returns (uint256 amountIn) {
        // Transfer the specified `amountInMaximum` to this contract.
        TransferHelper.safeTransferFrom(
            _tokenIn,
            _payeeAddress,
            address(this),
            _amountInMaximum
        );
        // Approve the router to spend  `amountInMaximum`.
        TransferHelper.safeApprove(
            _tokenIn,
            address(swapRouter),
            _amountInMaximum
        );

        // The parameter path is encoded as (tokenOut, fee, tokenIn/tokenOut, fee, tokenIn)
        // The tokenIn/tokenOut field is the shared token between the two pools used in the multiple pool swap. In this case USDC is the "shared" token.
        // For an exactOutput swap, the first swap that occurs is the swap which returns the eventual desired token.
        // In this case, our desired output token is WETH9 so that swap happpens first, and is encoded in the path accordingly.
        ISwapRouter.ExactOutputParams memory params = ISwapRouter
            .ExactOutputParams({
                path: _swapPath,
                recipient: _merchant,
                deadline: block.timestamp,
                amountOut: calculateRivelPrice(_amountOut),
                amountInMaximum: calculateRivelPrice(_amountInMaximum)
            });

        // Executes the swap, returning the amountIn actually spent.
        amountIn = swapRouter.exactOutput(params);

        // If the swap did not require the full amountInMaximum to achieve the exact amountOut then we refund msg.sender and approve the router to spend 0.
        if (amountIn < calculateRivelPrice(_amountInMaximum)) {
            TransferHelper.safeApprove(_tokenIn, address(swapRouter), 0);
            TransferHelper.safeTransfer(
                _tokenIn,
                _payeeAddress,
                calculateRivelPrice(_amountInMaximum) - amountIn
            );
        }
        return amountIn;
    }

    /**
     * @dev Called by the merchant, registering subscription information that can be called by the customer
     * @param _amountRecurring The maximum amount that can be paid in each subscription periods
     * @param _periodInterval The number of periodType that must elapse before the next payment is due in seconds
     * @return A bytes32 for the created merchantSubscriptionId
     */

    function createMerchantSubscription(
        address _merchant,
        address _tokenOut,
        uint256 _amountRecurring,
        uint256 _periodInterval,
        bytes32 _productId,
        uint256 _trialPeriod
    ) public onlyProcessor returns (bytes32) {
        require(
            tokenToOracle[_tokenOut] != address(0),
            "Unfortunately, we do not support this token yet."
        );

        Product memory newProduct = Product({
            merchant: _merchant,
            tokenOut: _tokenOut,
            amountRecurring: _amountRecurring,
            periodInterval: _periodInterval,
            productId: _productId,
            trialPeriod: _trialPeriod
        });

        // map merchant subscription id to merchant subscription
        merchantProducts[_productId] = newProduct;
        // add subscription to merchant's list of subscriptions
        merchants_products[_merchant].push(_productId);

        emit NewProduct(
            _merchant,
            _tokenOut,
            _amountRecurring,
            _periodInterval,
            _productId,
            _trialPeriod
        );

        return _productId;
    }

    /**
     * @dev Called by the subscriber on their own wallet, using data initiated by the merchant in a checkout flow.
     * @param _productId The address that will receive payments
     * @param _tokenAddressIn sets token address the subscriber will make payments in
     * @return A bytes32 for the created subscriptionId
     */

    function createSubscription(
        address _payeeAddress,
        bytes32 _productId,
        address _tokenAddressIn,
        bytes memory _path
    ) public payable returns (bytes32) {
        // Check that subscription start time is now or in the future

        require(
            tokenToOracle[_tokenAddressIn] != address(0),
            "Unfortunately, we do not support this token yet."
        );

        Product memory productData = merchantProducts[_productId];

        uint256 amountRequired = getExchangeAmount(
            _tokenAddressIn,
            productData.tokenOut,
            productData.amountRecurring
        );

        IERC20 token = IERC20(_tokenAddressIn);

        // // Check that owner has a balance of at least the initial and first recurring payment
        if (_tokenAddressIn != productData.tokenOut) {
            require(
                (token.balanceOf(_payeeAddress) >=
                    calculatePadding(amountRequired)),
                "Insufficient balance for 1x recurring amount"
            );

            // //  Check that contact has approval for at least the initial and first recurring payment

            require(
                (token.allowance(_payeeAddress, address(this)) >=
                    calculatePadding(amountRequired)),
                "Insufficient allowance for 1x recurring amount"
            );
        }

        uint256 nextPayment;

        if (productData.trialPeriod == 0) {
            nextPayment = block.timestamp + productData.periodInterval;
            // Make initial payment to merchant contract
            if (_tokenAddressIn == productData.tokenOut) {
                // Pay fee to rivel

                TransferHelper.safeTransferFrom(
                    _tokenAddressIn,
                    _payeeAddress,
                    address(this),
                    productData.amountRecurring
                );

                TransferHelper.safeTransfer(
                    _tokenAddressIn,
                    productData.merchant,
                    calculateRivelPrice(productData.amountRecurring)
                );
            } else {
                swapExactOutputMultihop(
                    productData.amountRecurring,
                    calculatePadding(amountRequired),
                    _path,
                    _tokenAddressIn,
                    _payeeAddress,
                    productData.merchant
                );
            }
        } else {
            nextPayment = block.timestamp + productData.trialPeriod;
        }

        // @dev all tokenAddressOut will be usdc or a stable coin for the near future
        Subscription memory newSubscription = Subscription({
            payeeAddress: _payeeAddress,
            tokenAddressIn: _tokenAddressIn,
            nextPaymentTime: nextPayment,
            productId: _productId
        });

        // Save subscription
        bytes32 subscriptionId = keccak256(
            abi.encodePacked(newSubscription.payeeAddress, block.timestamp)
        );

        subscriptions[subscriptionId] = newSubscription;
        // TODO check for existing subscriptionId

        // Add subscription to subscriber
        subscribers_subscriptions[newSubscription.payeeAddress].push(
            subscriptionId
        );

        emit NewSubscription(
            _payeeAddress,
            _tokenAddressIn,
            nextPayment,
            _productId,
            subscriptionId
        );

        return subscriptionId;
    }

    /**
     * @dev Get all subscriptions for a subscriber address
     * @param _subscriber The address of the subscriber
     * return An array of bytes32 values that map to subscriptions
     */

    function getSubscribersSubscriptions(address _subscriber)
        public
        view
        returns (bytes32[] memory _subscribers)
    {
        return subscribers_subscriptions[_subscriber];
    }

    /**
     * @dev Get all individual subscription plans for a merchant's address
     * @param _merchant The address of the merchant
     * return An array of bytes32 values that map to subscriptions
     */

    function getMerchantsProducts(address _merchant)
        public
        view
        returns (bytes32[] memory _products)
    {
        return merchants_products[_merchant];
    }

    /**
     * @dev Get subscription data from subscriptionId
     * @param _subscriptionId The address of the merchant
     * return An array of bytes32 values that map to subscriptions
     */

    function getSubscriptionData(bytes32 _subscriptionId)
        public
        view
        returns (Subscription memory _subscription)
    {
        return subscriptions[_subscriptionId];
    }

    /**
     * @dev Delete a subscription
     * @param  _subscriptionId The subscription ID to delete
     * @return true if the subscription has been deleted
     */

    function cancelSubscription(bytes32 _subscriptionId) public returns (bool) {
        Subscription storage subscription = subscriptions[_subscriptionId];
        require(
            subscription.payeeAddress == msg.sender,
            "You are not the subscription owner"
        );
        delete subscriptions[_subscriptionId];
        return true;
    }

    /**
     * @dev Called by or on behalf of the merchant to find whether a subscription has a payment due
     * @param _subscriptionId The subscription ID to process payments for
     * @return A boolean to indicate whether a payment is due
     */

    function paymentDue(bytes32 _subscriptionId) public view returns (bool) {
        Subscription memory subscription = subscriptions[_subscriptionId];

        // Check whether required time interval has passed since last payment
        if (subscription.nextPaymentTime <= block.timestamp) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Called by or on behalf of the merchant, in order to initiate a payment.
     * @param _subscriptionId The subscription ID to process payments for
     * @return A boolean to indicate whether the payment was successful
     */

    function processSubscription(bytes32 _subscriptionId, bytes memory _path)
        public
        payable
        onlyProcessor
        returns (bool)
    {
        Subscription storage subscription = subscriptions[_subscriptionId];

        Product memory productData = merchantProducts[subscription.productId];

        uint256 amountRequired = getExchangeAmount(
            subscription.tokenAddressIn,
            productData.tokenOut,
            productData.amountRecurring
        );

        IERC20 token = IERC20(subscription.tokenAddressIn);

        if (subscription.tokenAddressIn != productData.tokenOut) {
            require(
                (token.balanceOf(subscription.payeeAddress) >=
                    calculatePadding(amountRequired)),
                "Insufficient balance for recurring amount"
            );

            //  Check that contact has approval for recurring payment
            require(
                (token.allowance(subscription.payeeAddress, address(this)) >=
                    calculatePadding(amountRequired)),
                "Insufficient approval for recurring amount"
            );
        }

        require(
            (paymentDue(_subscriptionId)),
            "A Payment is not due for this subscription"
        );

        //@TODO add price calculation
        if (subscription.tokenAddressIn == productData.tokenOut) {
            TransferHelper.safeTransferFrom(
                subscription.tokenAddressIn,
                subscription.payeeAddress,
                address(this),
                productData.amountRecurring
            );

            TransferHelper.safeTransfer(
                address(this),
                productData.merchant,
                calculateRivelPrice(productData.amountRecurring)
            );
        } else {
            swapExactOutputMultihop(
                productData.amountRecurring,
                calculatePadding(amountRequired),
                _path,
                subscription.tokenAddressIn,
                subscription.payeeAddress,
                productData.merchant
            );
        }

        // Increment subscription nextPaymentTime by one interval
        // TODO support hour, day, week, month, year
        subscription.nextPaymentTime =
            subscription.nextPaymentTime +
            productData.periodInterval;

        return true;
    }

    /***
    // @dev rivel withdraw tokens
    ***/

    function withdrawToken(address _tokenContract, uint256 _amount)
        public
        payable
        onlyAdmin
    {
        IERC20 tokenContract = IERC20(_tokenContract);

        // transfer the token from address of this contract
        // to address of the user (executing the withdrawToken() function)
        tokenContract.transfer(msg.sender, _amount);
    }
}
